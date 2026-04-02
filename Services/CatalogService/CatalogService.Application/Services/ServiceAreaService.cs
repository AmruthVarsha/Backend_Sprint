using CatalogService.Application.DTOs.ServiceArea;
using CatalogService.Application.Exceptions;
using CatalogService.Application.Interfaces;
using CatalogService.Domain.Entities;
using CatalogService.Domain.Interfaces;

namespace CatalogService.Application.Services
{
    public class ServiceAreaService : IServiceAreaService
    {
        private readonly IServiceAreaRepository _serviceAreaRepo;
        private readonly IRestaurantRepository _restaurantRepo;

        public ServiceAreaService(
            IServiceAreaRepository serviceAreaRepo,
            IRestaurantRepository restaurantRepo)
        {
            _serviceAreaRepo = serviceAreaRepo;
            _restaurantRepo = restaurantRepo;
        }

        public async Task<IEnumerable<ServiceAreaDto>> GetByRestaurantIdAsync(Guid restaurantId)
        {
            if (!await _restaurantRepo.ExistsAsync(restaurantId))
                throw new NotFoundException(nameof(Restaurant), restaurantId);

            var areas = await _serviceAreaRepo.GetByRestaurantIdAsync(restaurantId);
            return areas.Select(Map);
        }

        public async Task<bool> IsPincodeServiceableAsync(Guid restaurantId, string pincode)
        {
            if (!await _restaurantRepo.ExistsAsync(restaurantId))
                throw new NotFoundException(nameof(Restaurant), restaurantId);

            if (string.IsNullOrWhiteSpace(pincode) || !System.Text.RegularExpressions.Regex.IsMatch(pincode, @"^\d{6}$"))
                throw new BadRequestException("Pincode must be exactly 6 digits.");

            return await _serviceAreaRepo.IsPincodeServiceableAsync(restaurantId, pincode);
        }

        public async Task<Guid> AddAsync(AddServiceAreaDto dto, string requestorId)
        {
            var restaurant = await _restaurantRepo.GetByIdAsync(dto.RestaurantId)
                ?? throw new NotFoundException(nameof(Restaurant), dto.RestaurantId);

            if (restaurant.OwnerId != requestorId)
                throw new ForbiddenException("You do not own this restaurant.");

            // Prevent duplicate pincodes for the same restaurant
            if (await _serviceAreaRepo.IsPincodeServiceableAsync(dto.RestaurantId, dto.Pincode))
                throw new ConflictException($"Pincode '{dto.Pincode}' is already in the service area for this restaurant.");

            var serviceArea = new ServiceArea
            {
                Id = Guid.NewGuid(),
                RestaurantId = dto.RestaurantId,
                Pincode = dto.Pincode,
                CreatedAt = DateTime.UtcNow
            };

            return await _serviceAreaRepo.CreateAsync(serviceArea);
        }

        public async Task RemoveAsync(Guid serviceAreaId, string requestorId)
        {
            var serviceArea = await _serviceAreaRepo.GetByIdAsync(serviceAreaId)
                ?? throw new NotFoundException(nameof(ServiceArea), serviceAreaId);

            var restaurant = await _restaurantRepo.GetByIdAsync(serviceArea.RestaurantId)
                ?? throw new NotFoundException(nameof(Restaurant), serviceArea.RestaurantId);

            if (restaurant.OwnerId != requestorId)
                throw new ForbiddenException("You do not own this restaurant.");

            await _serviceAreaRepo.DeleteAsync(serviceAreaId);
        }

        // ─── Mapping ─────────────────────────────────────────────────────────────

        private static ServiceAreaDto Map(ServiceArea sa) => new()
        {
            Id = sa.Id,
            RestaurantId = sa.RestaurantId,
            Pincode = sa.Pincode,
            CreatedAt = sa.CreatedAt
        };
    }
}
