using AuthService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace AuthService.Domain.Entities
{
    public class RoleApprovalRequest
    {
        [Key]
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public RoleEnum Role { get; set; }

        [Required]
        public bool IsApproved { get; set; } = false;

    }
}
