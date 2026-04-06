using OrderService.Domain.Enums;

namespace OrderService.Application.DTOs.Order
{
    public class OrderResponseDTO
    {
        public Guid Id { get; set; }
        public string CustomerId { get; set; } = string.Empty;
        public Guid RestaurantId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        public string? DeliveryInstructions { get; set; }
        public string? ScheduledSlot { get; set; }
        public decimal TotalAmount { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<OrderItemResponseDTO> Items { get; set; } = new();
    }

    public class OrderItemResponseDTO
    {
        public Guid Id { get; set; }
        public Guid MenuItemId { get; set; }
        public string MenuItemName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class OrderPaymentDTO
    {
        public Guid Id { get; set; }
        public string Method { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? TransactionReference { get; set; }
    }
}
