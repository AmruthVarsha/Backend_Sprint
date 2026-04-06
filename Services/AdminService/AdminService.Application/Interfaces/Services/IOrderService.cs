using AdminService.Application.DTOs.Orders;

namespace AdminService.Application.Interfaces.Services
{
    public interface IOrderService
    {
        Task<List<OrderSummaryDto>> GetAllOrdersAsync();
        Task UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusDto dto, string adminId);
    }
}
