using CatalogService.Application.DTOs.Cuisine;
using CatalogService.Application.Exceptions;
using CatalogService.Application.Interfaces;
using CatalogService.Domain.Entities;
using CatalogService.Domain.Interfaces;

namespace CatalogService.Application.Services
{
    public class CuisineService : ICuisineService
    {
        private readonly ICuisineRepository _cuisineRepo;

        public CuisineService(ICuisineRepository cuisineRepo)
        {
            _cuisineRepo = cuisineRepo;
        }

        public async Task<IEnumerable<CuisineDto>> GetAllAsync()
        {
            var cuisines = await _cuisineRepo.GetAllAsync();
            return cuisines.Select(Map);
        }

        public async Task<CuisineDto> GetByIdAsync(Guid id)
        {
            var cuisine = await _cuisineRepo.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Cuisine), id);

            return Map(cuisine);
        }

        public async Task<Guid> CreateAsync(CreateCuisineDto dto)
        {
            // Ensure name is unique (case-insensitive)
            var all = await _cuisineRepo.GetAllAsync();
            if (all.Any(c => c.Name.Equals(dto.Name.Trim(), StringComparison.OrdinalIgnoreCase)))
                throw new ConflictException($"A cuisine named '{dto.Name}' already exists.");

            var cuisine = new Cuisine
            {
                Id = Guid.NewGuid(),
                Name = dto.Name.Trim(),
                IsActive = true
            };

            return await _cuisineRepo.CreateAsync(cuisine);
        }

        public async Task UpdateAsync(Guid id, UpdateCuisineDto dto)
        {
            var cuisine = await _cuisineRepo.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Cuisine), id);

            // Ensure new name is unique (ignore self)
            var all = await _cuisineRepo.GetAllAsync();
            if (all.Any(c => c.Id != id && c.Name.Equals(dto.Name.Trim(), StringComparison.OrdinalIgnoreCase)))
                throw new ConflictException($"A cuisine named '{dto.Name}' already exists.");

            cuisine.Name = dto.Name.Trim();
            cuisine.IsActive = dto.IsActive;

            await _cuisineRepo.UpdateAsync(cuisine);
        }

        public async Task DeleteAsync(Guid id)
        {
            var cuisine = await _cuisineRepo.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Cuisine), id);

            // Guard: cannot delete if still referenced by restaurants
            if (cuisine.RestaurantCuisines.Any())
                throw new BadRequestException(
                    $"Cannot delete cuisine '{cuisine.Name}' because it is still linked to one or more restaurants.");

            await _cuisineRepo.DeleteAsync(id);
        }

        // ─── Mapping ─────────────────────────────────────────────────────────────

        private static CuisineDto Map(Cuisine c) => new()
        {
            Id = c.Id,
            Name = c.Name,
            IsActive = c.IsActive
        };
    }
}
