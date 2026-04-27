using OrderService.Application.DTOs.Order;

namespace OrderService.Application.Interfaces
{
    public interface IOrderService
    {
        Task<OrderResponseDTO> PlaceOrderAsync(PlaceOrderDTO dto, string customerId,string token);
        Task<IEnumerable<OrderResponseDTO>> GetOrderHistoryAsync(string userId, string userRole);
        Task<OrderResponseDTO> GetOrderByIdAsync(Guid id, string customerId);
        Task CancelOrderAsync(Guid id, string customerId, CancelOrderDTO dto);
        Task UpdateOrderStatusAsync(Guid id, UpdateOrderStatusDTO dto);
    }
}
