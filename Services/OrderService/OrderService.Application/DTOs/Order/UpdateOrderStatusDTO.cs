using System.ComponentModel.DataAnnotations;
using OrderService.Domain.Enums;

namespace OrderService.Application.DTOs.Order
{
    public class UpdateOrderStatusDTO
    {
        [Required]
        public OrderStatus Status { get; set; }
    }
}
