using OrderService.Domain.Enums;

namespace OrderService.Application.DTOs.Order
{
    public class OrderSummaryDTO
    {
        public Guid Id { get; set; }
        public OrderStatus Status { get; set; }
        public decimal TotalAmount { get; set; }
        public int ItemCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
