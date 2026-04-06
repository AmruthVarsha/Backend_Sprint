using AdminService.Domain.Entities;
using AdminService.Domain.Enums;

namespace AdminService.Domain.Interfaces
{
    public interface IOrderSummaryRepository
    {
        Task AddAsync(OrderSummary orderSummary);
        Task<List<OrderSummary>> GetAllAsync();
        Task<OrderSummary?> GetByOrderIdAsync(Guid orderId);
        Task<List<OrderSummary>> GetByDateRangeAsync(DateTime from, DateTime to);
        Task UpdateStatusAsync(Guid orderId, OrderStatus newStatus, DateTime updatedAt);
    }
}
