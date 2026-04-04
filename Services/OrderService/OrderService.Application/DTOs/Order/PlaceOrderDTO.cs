using System.ComponentModel.DataAnnotations;
using OrderService.Domain.Enums;

namespace OrderService.Application.DTOs.Order
{
    public class PlaceOrderDTO
    {
        [Required]
        public Guid CartId { get; set; }

        [Required]
        [StringLength(500, MinimumLength = 5)]
        public string DeliveryAddress { get; set; } = string.Empty;

        [StringLength(300)]
        public string? DeliveryInstructions { get; set; }

        [StringLength(100)]
        public string? ScheduledSlot { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; }
    }
}
