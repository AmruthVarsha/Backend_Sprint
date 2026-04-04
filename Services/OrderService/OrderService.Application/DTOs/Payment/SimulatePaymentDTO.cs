using System.ComponentModel.DataAnnotations;
using OrderService.Domain.Enums;

namespace OrderService.Application.DTOs.Payment
{
    public class SimulatePaymentDTO
    {
        [Required]
        public Guid OrderId { get; set; }

        [Required]
        public PaymentMethod Method { get; set; }
    }
}
