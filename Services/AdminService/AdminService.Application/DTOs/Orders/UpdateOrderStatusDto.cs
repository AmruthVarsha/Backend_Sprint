using System.ComponentModel.DataAnnotations;

namespace AdminService.Application.DTOs.Orders
{
    public class UpdateOrderStatusDto
    {
        [Required]
        public string NewStatus { get; set; } = string.Empty;

        [Required]
        [MinLength(5)]
        public string Reason { get; set; } = string.Empty;
    }
}
