using CatalogService.Application.DTOs.Restaurant;

namespace CatalogService.Application.Interfaces
{
    /// <summary>
    /// Application-level service for restaurant CRUD and discovery operations.
    /// Consumed by RestaurantController.
    /// </summary>
    public interface IRestaurantService
    {
        /// <summary>Returns a lightweight list of all active restaurants.</summary>
        Task<IEnumerable<RestaurantListItemDto>> GetAllAsync();

        /// <summary>Returns the full detail view of a single restaurant including its menu.</summary>
        Task<RestaurantDetailDto> GetByIdAsync(Guid id);

        /// <summary>Returns restaurants that serve a given cuisine.</summary>
        Task<IEnumerable<RestaurantListItemDto>> GetByCuisineAsync(Guid cuisineId);

        /// <summary>Full-text search across restaurant name and description.</summary>
        Task<IEnumerable<RestaurantListItemDto>> SearchAsync(string searchTerm);

        /// <summary>Returns restaurants that deliver to the supplied pincode.</summary>
        Task<IEnumerable<RestaurantListItemDto>> GetByPincodeAsync(string pincode);

        /// <summary>
        /// Creates a new restaurant owned by <paramref name="ownerId"/>.
        /// Returns the newly assigned restaurant ID.
        /// </summary>
        Task<Guid> CreateAsync(CreateRestaurantDto dto, string ownerId);

        /// <summary>Updates an existing restaurant. Owner must match <paramref name="requestorId"/>.</summary>
        Task UpdateAsync(Guid id, UpdateRestaurantDto dto, string requestorId);

        /// <summary>Soft-deletes a restaurant. Owner must match <paramref name="requestorId"/>.</summary>
        Task DeleteAsync(Guid id, string requestorId);
    }
}
