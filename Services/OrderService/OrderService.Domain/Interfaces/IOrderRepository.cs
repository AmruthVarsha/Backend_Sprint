using OrderService.Domain.Entities;

namespace OrderService.Domain.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order?> GetById(Guid id);
        Task<Order?> GetByIdWithDetails(Guid id);
        Task<IEnumerable<Order>> GetByCustomerId(string customerId);
        Task<IEnumerable<Order>> GetAll();
        Task AddAsync(Order order);
        Task UpdateAsync(Order order);
        Task DeleteAsync(Guid id);
    }
}
