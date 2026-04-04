using Microsoft.Identity.Client;
using OrderService.Domain.Interfaces;
using OrderService.Domain.Entities;
using OrderService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace OrderService.Infrastructure.Repositories
{
    public class CartItemRepository : ICartItemRepository
    {
        private readonly OrderDbContext _context;

        public CartItemRepository(OrderDbContext context)
        {
            this._context = context;
        }

        public async Task<CartItem?> GetById(Guid id)
        {
            return await _context.CartItems.FindAsync(id);
        }

        public async Task<IEnumerable<CartItem>> GetAllByCartId(Guid id)
        {
            return await _context.CartItems.Where(ci => ci.CartId == id).ToListAsync();
        }

        public async Task<IEnumerable<CartItem>> GetAll()
        {
            return await _context.CartItems.ToListAsync();
        }

        public async Task AddAsync(CartItem item)
        {
            _context.CartItems.Add(item);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(CartItem cartItem)
        {
            _context.CartItems.Update(cartItem);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteAsync(Guid id)
        {
            var item = await _context.CartItems.FindAsync(id);
            if(item == null)
            {
                return;
            }
            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }
}
