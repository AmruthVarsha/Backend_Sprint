using CatalogService.Application.DTOs.Category;

namespace CatalogService.Application.Interfaces
{
    /// <summary>
    /// Application-level service for managing menu categories within a restaurant.
    /// Consumed by CategoryController.
    /// </summary>
    public interface ICategoryService
    {
        /// <summary>Returns all categories belonging to a restaurant.</summary>
        Task<IEnumerable<CategoryDto>> GetByRestaurantIdAsync(Guid restaurantId);

        /// <summary>Returns a single category by its ID.</summary>
        Task<CategoryDto> GetByIdAsync(Guid id);

        /// <summary>Creates a new category. Returns the new category ID.</summary>
        Task<Guid> CreateAsync(CreateCategoryDto dto, string requestorId);

        /// <summary>Updates an existing category. Requestor must own the parent restaurant.</summary>
        Task UpdateAsync(Guid id, UpdateCategoryDto dto, string requestorId);

        /// <summary>Deletes a category and its menu items. Requestor must own the parent restaurant.</summary>
        Task DeleteAsync(Guid id, string requestorId);
    }
}
