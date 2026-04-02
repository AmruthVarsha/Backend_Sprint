using CatalogService.Domain.Entities;
using CatalogService.Domain.Interfaces;
using CatalogService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;


namespace CatalogService.Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly CatalogDbContext _context;
        public CategoryRepository(CatalogDbContext context)
        {
            this._context = context;
        }

        public async Task<IEnumerable<Category>> GetByRestaurantIdAsync(Guid restaurantId)
        {
            return await _context.Categories.Where(c => c.RestaurantId == restaurantId).ToListAsync();
        }
        public async Task<Category?> GetByIdAsync(Guid id)
        {
            return await _context.Categories.FindAsync(id);
        }

        public async Task<Category?> GetByNameAsync(Guid restaurantId, string name)
        {
            return await _context.Categories
                .FirstOrDefaultAsync(c =>
                    c.RestaurantId == restaurantId &&
                    c.Name.ToLower() == name.Trim().ToLower());
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Categories.AnyAsync(c => c.Id == id);
        }
        public async Task<Guid> CreateAsync(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return category.Id;
        }
        public async Task UpdateAsync(Category category)
        {
            _context.Categories.Update(category);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteAsync(Guid id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category is null) return;
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }

    }
}
