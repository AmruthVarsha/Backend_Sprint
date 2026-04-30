using CatalogService.Domain.Entities;
using CatalogService.Domain.Interfaces;
using CatalogService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace CatalogService.Infrastructure.Repositories
{
    public class RestaurantRepository : IRestaurantRepository
    {
        private readonly CatalogDbContext _context;
        public RestaurantRepository(CatalogDbContext context)
        {
            this._context = context;
        }

        public async Task<IEnumerable<Restaurant>> GetAllAsync()
        {
            return await _context.Restaurants
                .AsSplitQuery()
                .Include(r => r.Address)
                .Include(r => r.RestaurantCuisines)
                    .ThenInclude(rc => rc.Cuisine)
                .ToListAsync();
        }

        public async Task<Restaurant?> GetByIdAsync(Guid id)
        {
            return await _context.Restaurants
                .AsSplitQuery()
                .Include(r => r.Address)
                .Include(r => r.ServiceAreas)
                .Include(r => r.Categories)
                    .ThenInclude(c => c.MenuItems)
                .Include(r => r.RestaurantCuisines)
                    .ThenInclude(rc => rc.Cuisine)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Restaurant>> GetByCuisineAsync(Guid cuisineId)
        {
            return await _context.Restaurants
                .AsSplitQuery()
                .Include(r => r.Address)
                .Include(r => r.RestaurantCuisines)
                    .ThenInclude(rc => rc.Cuisine)
                .Where(r => r.RestaurantCuisines.Any(rc => rc.CuisineId == cuisineId))
                .ToListAsync();
        }

        public async Task<IEnumerable<Restaurant>> SearchAsync(string searchTerm)
        {
            return await _context.Restaurants
                .AsSplitQuery()
                .Include(r => r.Address)
                .Include(r => r.RestaurantCuisines)
                    .ThenInclude(rc => rc.Cuisine)
                .Where(r => r.Name.Contains(searchTerm) ||
                            r.RestaurantCuisines.Any(rc => rc.Cuisine.Name.Contains(searchTerm)) ||
                            r.Categories.Any(c => c.MenuItems.Any(m => m.Name.Contains(searchTerm))))
                .ToListAsync();
        }

        public async Task<IEnumerable<Restaurant>> GetByPincodeAsync(string pincode)
        {
            return await _context.Restaurants
                .AsSplitQuery()
                .Include(r => r.Address)
                .Include(r => r.RestaurantCuisines)
                    .ThenInclude(rc => rc.Cuisine)
                .Where(r => r.ServiceAreas.Any(s => s.Pincode == pincode))
                .ToListAsync();
        }

        public async Task<IEnumerable<Restaurant>> GetByOwnerIdAsync(string ownerId)
        {
            return await _context.Restaurants
                .AsSplitQuery()
                .Include(r => r.Address)
                .Include(r => r.RestaurantCuisines)
                    .ThenInclude(rc => rc.Cuisine)
                .Where(r => r.OwnerId == ownerId)
                .ToListAsync();
        }

        public async Task<Guid> CreateAsync(Restaurant restaurant)
        {
            _context.Restaurants.Add(restaurant);
            await _context.SaveChangesAsync();
            return restaurant.Id;
        }

        public async Task UpdateAsync(Restaurant restaurant)
        {
            _context.Restaurants.Update(restaurant);
            await _context.SaveChangesAsync();
        }
        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Restaurants.AnyAsync(r => r.Id == id);
        }

        public async Task DeleteAsync(Guid id)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);
            if (restaurant is null) return;
            _context.Restaurants.Remove(restaurant);
            await _context.SaveChangesAsync();
        }
    }
}
