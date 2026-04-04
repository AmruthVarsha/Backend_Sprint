using OrderService.Domain.Enums;

namespace OrderService.Domain.Entities
{
    public class Cart
    {
        public Guid Id { get; set; }
        public string CustomerId { get; set; } = string.Empty;
        public Guid RestaurantId { get; set; }
        public CartStatus Status { get; set; } = CartStatus.Active;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
