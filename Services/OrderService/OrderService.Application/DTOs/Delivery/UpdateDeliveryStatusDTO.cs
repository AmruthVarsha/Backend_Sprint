using System.ComponentModel.DataAnnotations;
using OrderService.Domain.Enums;

namespace OrderService.Application.DTOs.Delivery
{
    public class UpdateDeliveryStatusDTO
    {
        [Required]
        public DeliveryStatus Status { get; set; }
    }
}
