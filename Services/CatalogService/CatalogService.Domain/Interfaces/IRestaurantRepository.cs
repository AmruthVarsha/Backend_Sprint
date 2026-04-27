using CatalogService.Domain.Entities;

namespace CatalogService.Domain.Interfaces
{
    public interface IRestaurantRepository
    {
        public Task<IEnumerable<Restaurant>> GetAllAsync();
        public Task<Restaurant?> GetByIdAsync(Guid id);
        public Task<IEnumerable<Restaurant>> GetByCuisineAsync(Guid cuisineId);
        public Task<IEnumerable<Restaurant>> SearchAsync(string searchTerm);
        public Task<IEnumerable<Restaurant>> GetByPincodeAsync(string pincode);
        public Task<IEnumerable<Restaurant>> GetByOwnerIdAsync(string ownerId);
        public Task<Guid> CreateAsync(Restaurant restaurant);
        public Task UpdateAsync(Restaurant restaurant);
        public Task<bool> ExistsAsync(Guid id);
        public Task DeleteAsync(Guid id);
    }
}

