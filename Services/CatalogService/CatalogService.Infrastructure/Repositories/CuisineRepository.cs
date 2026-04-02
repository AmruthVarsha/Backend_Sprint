using CatalogService.Domain.Entities;
using CatalogService.Domain.Interfaces;
using CatalogService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;


namespace CatalogService.Infrastructure.Repositories
{
    public class CuisineRepository : ICuisineRepository
    {
        private readonly CatalogDbContext _context;
        public CuisineRepository(CatalogDbContext context)
        {
            this._context = context;
        }

        public async Task<IEnumerable<Cuisine>> GetAllAsync()
        {
            return await _context.Cuisines.ToListAsync();
        }
        public async Task<Cuisine?> GetByIdAsync(Guid id)
        {
            return await _context.Cuisines.FindAsync(id);
        }

        public async Task<Cuisine?> GetByNameAsync(string name)
        {
            return await _context.Cuisines
                .FirstOrDefaultAsync(c => c.Name.ToLower() == name.Trim().ToLower());
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Cuisines.AnyAsync(c => c.Id == id);
        }
        public async Task<Guid> CreateAsync(Cuisine cuisine)
        {
            _context.Cuisines.Add(cuisine);
            await _context.SaveChangesAsync();
            return cuisine.Id;
        }
        public async Task UpdateAsync(Cuisine cuisine)
        {
            _context.Cuisines.Update(cuisine);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var cuisine = await _context.Cuisines.FindAsync(id);
            if (cuisine is null) return;
            _context.Cuisines.Remove(cuisine);
            await _context.SaveChangesAsync();
        }
    }
}
