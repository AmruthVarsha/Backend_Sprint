using System.ComponentModel.DataAnnotations;

namespace OrderService.Application.DTOs.Order
{
    public class CancelOrderDTO
    {
        [StringLength(500)]
        public string? CancellationReason { get; set; }
    }
}
