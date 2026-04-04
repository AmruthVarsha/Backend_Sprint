using OrderService.Application.DTOs.Order;

namespace OrderService.Application.Interfaces
{
    public interface IOrderService
    {
        Task<OrderResponseDTO> PlaceOrderAsync(PlaceOrderDTO dto, string customerId);
        Task<IEnumerable<OrderSummaryDTO>> GetOrderHistoryAsync(string customerId);
        Task<OrderResponseDTO> GetOrderByIdAsync(Guid id, string customerId);
        Task CancelOrderAsync(Guid id, string customerId, CancelOrderDTO dto);
        Task UpdateOrderStatusAsync(Guid id, UpdateOrderStatusDTO dto);
    }
}
