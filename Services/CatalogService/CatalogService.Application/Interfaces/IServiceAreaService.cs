using CatalogService.Application.DTOs.ServiceArea;

namespace CatalogService.Application.Interfaces
{
    /// <summary>
    /// Application-level service for managing a restaurant's delivery service areas.
    /// Consumed by ServiceAreaController.
    /// </summary>
    public interface IServiceAreaService
    {
        /// <summary>Returns all pincodes a restaurant delivers to.</summary>
        Task<IEnumerable<ServiceAreaDto>> GetByRestaurantIdAsync(Guid restaurantId);

        /// <summary>Returns true if the restaurant delivers to the given pincode.</summary>
        Task<bool> IsPincodeServiceableAsync(Guid restaurantId, string pincode);

        /// <summary>Adds a new pincode to a restaurant's service area. Returns the new ID.</summary>
        Task<Guid> AddAsync(AddServiceAreaDto dto, string requestorId);

        /// <summary>Removes a pincode from a restaurant's service area. Requestor must own the restaurant.</summary>
        Task RemoveAsync(Guid serviceAreaId, string requestorId);
    }
}
