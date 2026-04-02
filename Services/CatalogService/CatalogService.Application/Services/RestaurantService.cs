using CatalogService.Application.DTOs.Category;
using CatalogService.Application.DTOs.MenuItem;
using CatalogService.Application.DTOs.Restaurant;
using CatalogService.Application.Exceptions;
using CatalogService.Application.Interfaces;
using CatalogService.Domain.Entities;
using CatalogService.Domain.Interfaces;

namespace CatalogService.Application.Services
{
    public class RestaurantService : IRestaurantService
    {
        private readonly IRestaurantRepository _restaurantRepo;
        private readonly ICuisineRepository _cuisineRepo;

        public RestaurantService(
            IRestaurantRepository restaurantRepo,
            ICuisineRepository cuisineRepo)
        {
            _restaurantRepo = restaurantRepo;
            _cuisineRepo = cuisineRepo;
        }

        // ─── Queries ─────────────────────────────────────────────────────────────

        public async Task<IEnumerable<RestaurantListItemDto>> GetAllAsync()
        {
            var restaurants = await _restaurantRepo.GetAllAsync();
            return restaurants.Select(MapToListItem);
        }

        public async Task<RestaurantDetailDto> GetByIdAsync(Guid id)
        {
            var restaurant = await _restaurantRepo.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Restaurant), id);

            return MapToDetail(restaurant);
        }

        public async Task<IEnumerable<RestaurantListItemDto>> GetByCuisineAsync(Guid cuisineId)
        {
            if (!await _cuisineRepo.ExistsAsync(cuisineId))
                throw new NotFoundException(nameof(Cuisine), cuisineId);

            var restaurants = await _restaurantRepo.GetByCuisineAsync(cuisineId);
            return restaurants.Select(MapToListItem);
        }

        public async Task<IEnumerable<RestaurantListItemDto>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                throw new BadRequestException("Search term cannot be empty.");

            var restaurants = await _restaurantRepo.SearchAsync(searchTerm.Trim());
            return restaurants.Select(MapToListItem);
        }

        public async Task<IEnumerable<RestaurantListItemDto>> GetByPincodeAsync(string pincode)
        {
            if (string.IsNullOrWhiteSpace(pincode) || !System.Text.RegularExpressions.Regex.IsMatch(pincode, @"^\d{6}$"))
                throw new BadRequestException("Pincode must be exactly 6 digits.");

            var restaurants = await _restaurantRepo.GetByPincodeAsync(pincode);
            return restaurants.Select(MapToListItem);
        }

        // ─── Commands ────────────────────────────────────────────────────────────

        public async Task<Guid> CreateAsync(CreateRestaurantDto dto, string ownerId)
        {
            if (string.IsNullOrEmpty(ownerId))
                throw new UnauthorizedException("Owner ID is required.");

            // Resolve cuisine names → IDs
            var cuisineIds = new List<Guid>();
            foreach (var name in dto.CuisineNames)
            {
                var cuisine = await _cuisineRepo.GetByNameAsync(name)
                    ?? throw new NotFoundException($"Cuisine '{name}' was not found.");
                cuisineIds.Add(cuisine.Id);
            }

            if (!TimeOnly.TryParse(dto.OpeningTime, out var openingTime))
                throw new BadRequestException("OpeningTime must be in HH:mm format.");

            if (!TimeOnly.TryParse(dto.ClosingTime, out var closingTime))
                throw new BadRequestException("ClosingTime must be in HH:mm format.");

            var restaurant = new Restaurant
            {
                Id = Guid.NewGuid(),
                OwnerId = ownerId,
                Name = dto.Name.Trim(),
                Description = dto.Description?.Trim(),
                LogoUrl = dto.LogoUrl,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email.ToLowerInvariant(),
                OpeningTime = openingTime,
                ClosingTime = closingTime,
                PrepTimeMinutes = dto.PrepTimeMinutes,
                IsActive = true,
                IsApproved = false,
                Address = new Address
                {
                    Id = Guid.NewGuid(),
                    Street = dto.Address.Street.Trim(),
                    City = dto.Address.City.Trim(),
                    State = dto.Address.State.Trim(),
                    Pincode = dto.Address.Pincode
                },
                RestaurantCuisines = cuisineIds
                    .Select(cid => new RestaurantCuisine
                    {
                        Id = Guid.NewGuid(),
                        CuisineId = cid
                    })
                    .ToList()
            };

            return await _restaurantRepo.CreateAsync(restaurant);
        }

        public async Task UpdateAsync(Guid id, UpdateRestaurantDto dto, string requestorId)
        {
            var restaurant = await _restaurantRepo.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Restaurant), id);

            if (restaurant.OwnerId != requestorId)
                throw new ForbiddenException("You do not own this restaurant.");

            // Resolve cuisine names → IDs
            var cuisineIds = new List<Guid>();
            foreach (var name in dto.CuisineNames)
            {
                var cuisine = await _cuisineRepo.GetByNameAsync(name)
                    ?? throw new NotFoundException($"Cuisine '{name}' was not found.");
                cuisineIds.Add(cuisine.Id);
            }

            if (!TimeOnly.TryParse(dto.OpeningTime, out var openingTime))
                throw new BadRequestException("OpeningTime must be in HH:mm format.");

            if (!TimeOnly.TryParse(dto.ClosingTime, out var closingTime))
                throw new BadRequestException("ClosingTime must be in HH:mm format.");

            restaurant.Name = dto.Name.Trim();
            restaurant.Description = dto.Description?.Trim();
            restaurant.LogoUrl = dto.LogoUrl;
            restaurant.PhoneNumber = dto.PhoneNumber;
            restaurant.Email = dto.Email.ToLowerInvariant();
            restaurant.OpeningTime = openingTime;
            restaurant.ClosingTime = closingTime;
            restaurant.PrepTimeMinutes = dto.PrepTimeMinutes;

            restaurant.Address.Street = dto.Address.Street.Trim();
            restaurant.Address.City = dto.Address.City.Trim();
            restaurant.Address.State = dto.Address.State.Trim();
            restaurant.Address.Pincode = dto.Address.Pincode;

            // Replace cuisines (full replacement by names)
            restaurant.RestaurantCuisines = cuisineIds
                .Select(cid => new RestaurantCuisine
                {
                    Id = Guid.NewGuid(),
                    RestaurantId = id,
                    CuisineId = cid
                })
                .ToList();

            await _restaurantRepo.UpdateAsync(restaurant);
        }

        public async Task DeleteAsync(Guid id, string requestorId)
        {
            var restaurant = await _restaurantRepo.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Restaurant), id);

            if (restaurant.OwnerId != requestorId)
                throw new ForbiddenException("You do not own this restaurant.");

            await _restaurantRepo.DeleteAsync(id);
        }

        // ─── Mapping helpers ─────────────────────────────────────────────────────

        private static RestaurantListItemDto MapToListItem(Restaurant r) => new()
        {
            Id = r.Id,
            Name = r.Name,
            Description = r.Description,
            LogoUrl = r.LogoUrl,
            Rating = r.Rating,
            TotalRatings = r.TotalRatings,
            PrepTimeMinutes = r.PrepTimeMinutes,
            IsActive = r.IsActive,
            City = r.Address?.City ?? string.Empty,
            Pincode = r.Address?.Pincode ?? string.Empty,
            OpeningTime = r.OpeningTime.ToString("HH:mm"),
            ClosingTime = r.ClosingTime.ToString("HH:mm"),
            Cuisines = r.RestaurantCuisines
                .Select(rc => rc.Cuisine?.Name ?? string.Empty)
                .Where(name => !string.IsNullOrEmpty(name))
                .ToList()
        };

        private static RestaurantDetailDto MapToDetail(Restaurant r) => new()
        {
            Id = r.Id,
            OwnerId = r.OwnerId,
            Name = r.Name,
            Description = r.Description,
            LogoUrl = r.LogoUrl,
            PhoneNumber = r.PhoneNumber,
            Email = r.Email,
            OpeningTime = r.OpeningTime.ToString("HH:mm"),
            ClosingTime = r.ClosingTime.ToString("HH:mm"),
            PrepTimeMinutes = r.PrepTimeMinutes,
            Rating = r.Rating,
            TotalRatings = r.TotalRatings,
            IsActive = r.IsActive,
            IsApproved = r.IsApproved,
            Address = r.Address == null ? new() : new DTOs.Restaurant.AddressDto
            {
                Street = r.Address.Street,
                City = r.Address.City,
                State = r.Address.State,
                Pincode = r.Address.Pincode
            },
            Cuisines = r.RestaurantCuisines
                .Select(rc => rc.Cuisine?.Name ?? string.Empty)
                .Where(name => !string.IsNullOrEmpty(name))
                .ToList(),
            Menu = r.Categories
                .OrderBy(c => c.DisplayOrder)
                .Select(cat => new CategoryWithItemsDto
                {
                    Id = cat.Id,
                    Name = cat.Name,
                    DisplayOrder = cat.DisplayOrder,
                    Items = cat.MenuItems
                        .Where(mi => mi.IsAvailable)
                        .Select(mi => new MenuItemDto
                        {
                            Id = mi.Id,
                            RestaurantId = mi.RestaurantId,
                            CategoryId = mi.CategoryId,
                            CategoryName = cat.Name,
                            Name = mi.Name,
                            Description = mi.Description,
                            ImageUrl = mi.ImageUrl,
                            Price = mi.Price,
                            IsVeg = mi.IsVeg,
                            IsAvailable = mi.IsAvailable,
                            PrepTimeMinutes = mi.PrepTimeMinutes
                        })
                        .ToList()
                })
                .ToList()
        };
    }
}
