using CatalogService.Application.DTOs.Category;
using CatalogService.Application.Exceptions;
using CatalogService.Application.Interfaces;
using CatalogService.Domain.Entities;
using CatalogService.Domain.Interfaces;

namespace CatalogService.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepo;
        private readonly IRestaurantRepository _restaurantRepo;

        public CategoryService(
            ICategoryRepository categoryRepo,
            IRestaurantRepository restaurantRepo)
        {
            _categoryRepo = categoryRepo;
            _restaurantRepo = restaurantRepo;
        }

        public async Task<IEnumerable<CategoryDto>> GetByRestaurantIdAsync(Guid restaurantId)
        {
            if (!await _restaurantRepo.ExistsAsync(restaurantId))
                throw new NotFoundException(nameof(Restaurant), restaurantId);

            var categories = await _categoryRepo.GetByRestaurantIdAsync(restaurantId);
            return categories.Select(Map);
        }

        public async Task<CategoryDto> GetByIdAsync(Guid id)
        {
            var category = await _categoryRepo.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Category), id);

            return Map(category);
        }

        public async Task<Guid> CreateAsync(CreateCategoryDto dto, string requestorId)
        {
            var restaurant = await _restaurantRepo.GetByIdAsync(dto.RestaurantId)
                ?? throw new NotFoundException(nameof(Restaurant), dto.RestaurantId);

            if (restaurant.OwnerId != requestorId)
                throw new ForbiddenException("You do not own this restaurant.");

            var category = new Category
            {
                Id = Guid.NewGuid(),
                RestaurantId = dto.RestaurantId,
                Name = dto.Name.Trim(),
                DisplayOrder = dto.DisplayOrder,
                IsActive = true
            };

            return await _categoryRepo.CreateAsync(category);
        }

        public async Task UpdateAsync(Guid id, UpdateCategoryDto dto, string requestorId)
        {
            var category = await _categoryRepo.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Category), id);

            var restaurant = await _restaurantRepo.GetByIdAsync(category.RestaurantId)
                ?? throw new NotFoundException(nameof(Restaurant), category.RestaurantId);

            if (restaurant.OwnerId != requestorId)
                throw new ForbiddenException("You do not own this restaurant.");

            category.Name = dto.Name.Trim();
            category.DisplayOrder = dto.DisplayOrder;
            category.IsActive = dto.IsActive;

            await _categoryRepo.UpdateAsync(category);
        }

        public async Task DeleteAsync(Guid id, string requestorId)
        {
            var category = await _categoryRepo.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Category), id);

            var restaurant = await _restaurantRepo.GetByIdAsync(category.RestaurantId)
                ?? throw new NotFoundException(nameof(Restaurant), category.RestaurantId);

            if (restaurant.OwnerId != requestorId)
                throw new ForbiddenException("You do not own this restaurant.");

            await _categoryRepo.DeleteAsync(id);
        }

        // ─── Mapping ─────────────────────────────────────────────────────────────

        private static CategoryDto Map(Category c) => new()
        {
            Id = c.Id,
            RestaurantId = c.RestaurantId,
            Name = c.Name,
            DisplayOrder = c.DisplayOrder,
            IsActive = c.IsActive
        };
    }
}
