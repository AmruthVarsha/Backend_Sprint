using CatalogService.Application.DTOs.MenuItem;

namespace CatalogService.Application.Interfaces
{

    public interface IMenuItemService
    {
        Task<IEnumerable<MenuItemDto>> GetByRestaurantIdAsync(Guid restaurantId);

        Task<IEnumerable<MenuItemDto>> GetByCategoryIdAsync(Guid categoryId);

        Task<MenuItemDto> GetByIdAsync(Guid id);

        Task<Guid> CreateAsync(CreateMenuItemDto dto, string requestorId);

        Task UpdateAsync(Guid id, UpdateMenuItemDto dto, string requestorId);

        Task DeleteAsync(Guid id, string requestorId);
    }
}
