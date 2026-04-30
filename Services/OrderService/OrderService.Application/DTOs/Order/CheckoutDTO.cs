using System.ComponentModel.DataAnnotations;
using OrderService.Domain.Enums;

namespace OrderService.Application.DTOs.Order
{
    public class CheckoutDTO
    {
        [Required]
        public Guid AddressId { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; }

        [StringLength(300)]
        public string? DeliveryInstructions { get; set; }

        [StringLength(100)]
        public string? ScheduledSlot { get; set; }

        [Required]
        public List<CartItemDTO> Items { get; set; } = new();
    }

    public class CartItemDTO
    {
        public Guid MenuItemId { get; set; }
        public string MenuItemName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public Guid RestaurantId { get; set; }
    }
}
