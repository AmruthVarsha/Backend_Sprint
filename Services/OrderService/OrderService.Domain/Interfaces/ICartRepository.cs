using System;
using System.Collections.Generic;
using System.Text;
using OrderService.Domain.Entities;

namespace OrderService.Domain.Interfaces
{
    public interface ICartRepository
    {
        public Task<Cart?> GetById(Guid id);
        public Task<IEnumerable<Cart>> GetAll();
        public Task<IEnumerable<Cart>> GetByCustomerId(string customerId);
        public Task AddAsync(Cart cart);
        public Task UpdateAsync(Cart cart);
        public Task DeleteAsync(Guid id);
    }
}
