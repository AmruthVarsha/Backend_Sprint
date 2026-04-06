namespace AdminService.Application.DTOs.Orders
{
    public class OrderSummaryDto
    {
        public Guid OrderId { get; set; }
        public string CustomerId { get; set; } = string.Empty;
        public string RestaurantName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime PlacedAt { get; set; }
        public DateTime LastUpdatedAt { get; set; }
    }
}
