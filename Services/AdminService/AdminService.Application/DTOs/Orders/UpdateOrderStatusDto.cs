using System.ComponentModel.DataAnnotations;
using AdminService.Domain.Enums;

namespace AdminService.Application.DTOs.Orders
{
    public class UpdateOrderStatusDto
    {
        [Required]
        public OrderStatus NewStatus { get; set; }

        [Required]
        [MinLength(5)]
        public string Reason { get; set; } = string.Empty;
    }
}
