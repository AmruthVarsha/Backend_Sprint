using System;
using System.Collections.Generic;
using System.Text;
using OrderService.Domain.Entities;

namespace OrderService.Domain.Interfaces
{
    public interface ICartItemRepository
    {
        public Task<CartItem?> GetById(Guid id);
        public Task<IEnumerable<CartItem>> GetAll();
        public Task<IEnumerable<CartItem>> GetAllByCartId(Guid id);
        public Task AddAsync(CartItem cartItem);
        public Task UpdateAsync(CartItem cartItem);
        public Task DeleteAsync(Guid id);
    }
}
