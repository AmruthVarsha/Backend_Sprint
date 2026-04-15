using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities
{
    public class User
    {
        [Key]
        public string Id {  get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; } = string.Empty;

        public bool EmailConfirmed { get; set; }

        public bool IsActive { get; set; } = true;

        public bool TwoFactorEnabled { get; set; }

        [Required]
        [Phone]
        [MaxLength(20)]
        public string PhoneNo { get; set; } = string.Empty;
    }
}
