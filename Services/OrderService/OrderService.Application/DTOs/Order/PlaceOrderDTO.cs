using System.ComponentModel.DataAnnotations;
using OrderService.Domain.Enums;

namespace OrderService.Application.DTOs.Order
{
    public class PlaceOrderDTO
    {
        [Required]
        public Guid CartId { get; set; }

        [Required]
        public Guid AddressId { get; set; }

        [StringLength(300)]
        public string? DeliveryInstructions { get; set; }

        [StringLength(100)]
        public string? ScheduledSlot { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; }
    }
}
