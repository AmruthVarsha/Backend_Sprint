namespace OrderService.Application.DTOs.Order
{
    // ─── Customer-facing: full grouped order ────────────────────────────────────

    /// <summary>Full order response for the customer — shows all restaurants grouped.</summary>
    public class OrderResponseDTO
    {
        public Guid Id { get; set; }
        public string CustomerId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        // Delivery address
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

        public string? DeliveryAgentId { get; set; }
        public string? DeliveryAgentName { get; set; }

        // Payment snapshot
        public OrderPaymentDTO? Payment { get; set; }

        // Grouped per-restaurant sub-orders
        public List<RestaurantOrderSummaryDTO> RestaurantOrders { get; set; } = new();
    }

    /// <summary>Per-restaurant breakdown inside a customer's order response.</summary>
    public class RestaurantOrderSummaryDTO
    {
        public Guid Id { get; set; }
        public Guid RestaurantId { get; set; }
        public string RestaurantName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // e.g., "Preparing"
        public decimal SubTotal { get; set; }
        public string? CancellationReason { get; set; }
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
