using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs
{
    public class PromoteRoleDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^(Customer|Partner|DeliveryAgent|Admin)$")]
        public string RoleName { get; set; } = string.Empty;
    }
}
