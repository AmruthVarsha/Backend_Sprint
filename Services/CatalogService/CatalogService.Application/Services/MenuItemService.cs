using CatalogService.Application.DTOs.MenuItem;
using CatalogService.Application.Exceptions;
using CatalogService.Application.Interfaces;
using CatalogService.Domain.Entities;
using CatalogService.Domain.Interfaces;

namespace CatalogService.Application.Services
{
    public class MenuItemService : IMenuItemService
    {
        private readonly IMenuItemRepository _menuItemRepo;
        private readonly IRestaurantRepository _restaurantRepo;
        private readonly ICategoryRepository _categoryRepo;

        public MenuItemService(
            IMenuItemRepository menuItemRepo,
            IRestaurantRepository restaurantRepo,
            ICategoryRepository categoryRepo)
        {
            _menuItemRepo = menuItemRepo;
            _restaurantRepo = restaurantRepo;
            _categoryRepo = categoryRepo;
        }

        public async Task<IEnumerable<MenuItemDto>> GetByRestaurantIdAsync(Guid restaurantId)
        {
            if (!await _restaurantRepo.ExistsAsync(restaurantId))
                throw new NotFoundException(nameof(Restaurant), restaurantId);

            var items = await _menuItemRepo.GetByRestaurantIdAsync(restaurantId);
            return items.Select(Map);
        }

        public async Task<IEnumerable<MenuItemDto>> GetByCategoryIdAsync(Guid categoryId)
        {
            if (!await _categoryRepo.ExistsAsync(categoryId))
                throw new NotFoundException(nameof(Category), categoryId);

            var items = await _menuItemRepo.GetByCategoryIdAsync(categoryId);
            return items.Select(Map);
        }

        public async Task<MenuItemDto> GetByIdAsync(Guid id)
        {
            var item = await _menuItemRepo.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(MenuItem), id);

            return Map(item);
        }

        public async Task<Guid> CreateAsync(CreateMenuItemDto dto, string requestorId)
        {
            var restaurant = await _restaurantRepo.GetByIdAsync(dto.RestaurantId)
                ?? throw new NotFoundException(nameof(Restaurant), dto.RestaurantId);

            if (restaurant.OwnerId != requestorId)
                throw new ForbiddenException("You do not own this restaurant.");

            // Resolve category name → ID within this restaurant
            var category = await _categoryRepo.GetByNameAsync(dto.RestaurantId, dto.CategoryName)
                ?? throw new NotFoundException($"Category '{dto.CategoryName}' was not found.");

            var menuItem = new MenuItem
            {
                Id = Guid.NewGuid(),
                RestaurantId = dto.RestaurantId,
                CategoryId = category.Id,
                Name = dto.Name.Trim(),
                Description = dto.Description?.Trim(),
                ImageUrl = dto.ImageUrl,
                Price = dto.Price,
                IsVeg = dto.IsVeg,
                IsAvailable = true,
                PrepTimeMinutes = dto.PrepTimeMinutes
            };

            return await _menuItemRepo.CreateAsync(menuItem);
        }

        public async Task UpdateAsync(Guid id, UpdateMenuItemDto dto, string requestorId)
        {
            var menuItem = await _menuItemRepo.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(MenuItem), id);

            var restaurant = await _restaurantRepo.GetByIdAsync(menuItem.RestaurantId)
                ?? throw new NotFoundException(nameof(Restaurant), menuItem.RestaurantId);

            if (restaurant.OwnerId != requestorId)
                throw new ForbiddenException("You do not own this restaurant.");

            // Resolve category name → ID within this restaurant
            var category = await _categoryRepo.GetByNameAsync(menuItem.RestaurantId, dto.CategoryName)
                ?? throw new NotFoundException($"Category '{dto.CategoryName}' was not found.");

            menuItem.CategoryId = category.Id;
            menuItem.Name = dto.Name.Trim();
            menuItem.Description = dto.Description?.Trim();
            menuItem.ImageUrl = dto.ImageUrl;
            menuItem.Price = dto.Price;
            menuItem.IsVeg = dto.IsVeg;
            menuItem.IsAvailable = dto.IsAvailable;
            menuItem.PrepTimeMinutes = dto.PrepTimeMinutes;

            await _menuItemRepo.UpdateAsync(menuItem);
        }

        public async Task DeleteAsync(Guid id, string requestorId)
        {
            var menuItem = await _menuItemRepo.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(MenuItem), id);

            var restaurant = await _restaurantRepo.GetByIdAsync(menuItem.RestaurantId)
                ?? throw new NotFoundException(nameof(Restaurant), menuItem.RestaurantId);

            if (restaurant.OwnerId != requestorId)
                throw new ForbiddenException("You do not own this restaurant.");

            await _menuItemRepo.DeleteAsync(id);
        }

        // ─── Mapping ─────────────────────────────────────────────────────────────

        private static MenuItemDto Map(MenuItem mi) => new()
        {
            Id = mi.Id,
            RestaurantId = mi.RestaurantId,
            CategoryId = mi.CategoryId,
            CategoryName = mi.Category?.Name ?? string.Empty,
            Name = mi.Name,
            Description = mi.Description,
            ImageUrl = mi.ImageUrl,
            Price = mi.Price,
            IsVeg = mi.IsVeg,
            IsAvailable = mi.IsAvailable,
            PrepTimeMinutes = mi.PrepTimeMinutes
        };
    }
}
