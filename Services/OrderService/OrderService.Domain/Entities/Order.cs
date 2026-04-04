using OrderService.Domain.Enums;

namespace OrderService.Domain.Entities
{
    public class Order
    {
        public Guid Id { get; set; }
        public string CustomerId { get; set; } = string.Empty;
        public Guid RestaurantId { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.PaymentPending;
        public string DeliveryAddress { get; set; } = string.Empty;
        public string? DeliveryInstructions { get; set; }
        public string? ScheduledSlot { get; set; }
        public decimal TotalAmount { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public Payment? Payment { get; set; }
        public DeliveryAssignment? DeliveryAssignment { get; set; }
    }
}