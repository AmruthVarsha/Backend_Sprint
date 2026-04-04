using System;
using System.Collections.Generic;
using System.Text;
using OrderService.Domain.Entities;

namespace OrderService.Domain.Interfaces
{
    public interface IOrderItemRepository
    {
        public Task<OrderItem?> GetById(Guid id);
        public Task<IEnumerable<OrderItem>> GetAll();
        public Task AddAsync(OrderItem orderItem);
        public Task UpdateAsync(OrderItem orderItem);
        public Task DeleteAsync(Guid id);
    }
}
