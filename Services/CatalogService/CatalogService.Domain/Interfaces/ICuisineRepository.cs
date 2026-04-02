using CatalogService.Domain.Entities;

namespace CatalogService.Domain.Interfaces
{
    public interface ICuisineRepository
    {
        public Task<IEnumerable<Cuisine>> GetAllAsync();
        public Task<Cuisine?> GetByIdAsync(Guid id);
        public Task<Cuisine?> GetByNameAsync(string name);
        public Task<bool> ExistsAsync(Guid id);
        public Task<Guid> CreateAsync(Cuisine cuisine);
        public Task UpdateAsync(Cuisine cuisine);
        public Task DeleteAsync(Guid id);
    }
}