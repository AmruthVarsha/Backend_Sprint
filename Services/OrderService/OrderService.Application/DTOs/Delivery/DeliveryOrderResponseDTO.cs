namespace OrderService.Application.DTOs.Delivery
{
    /// <summary>
    /// Delivery agent view of an assigned order.
    /// Shows the FULL order: all restaurants to pick up from + final drop-off.
    /// </summary>
    public class DeliveryOrderResponseDTO
    {
        public Guid OrderId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string OverallStatus { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;

        // Drop-off address
        public string DropoffStreet { get; set; } = string.Empty;
        public string DropoffCity { get; set; } = string.Empty;
        public string DropoffState { get; set; } = string.Empty;
        public string DropoffPincode { get; set; } = string.Empty;
        public string? DeliveryInstructions { get; set; }

        // Assignment info
        public Guid AssignmentId { get; set; }
        public string AssignmentStatus { get; set; } = string.Empty;
        public DateTime? PickedUpAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public DateTime CreatedAt { get; set; }

        // All pickup stops
        public List<DeliveryRestaurantStopDTO> RestaurantStops { get; set; } = new();
    }

    /// <summary>One restaurant pickup stop in the delivery route.</summary>
    public class DeliveryRestaurantStopDTO
    {
        public Guid SubOrderId { get; set; }
        public string RestaurantName { get; set; } = string.Empty;
        public string RestaurantAddress { get; set; } = string.Empty;
        public string SubOrderStatus { get; set; } = string.Empty; // e.g., ReadyForPickup
        public decimal SubTotal { get; set; }
        public List<DeliveryItemDTO> Items { get; set; } = new();
    }

    public class DeliveryItemDTO
    {
        public string MenuItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }
}
