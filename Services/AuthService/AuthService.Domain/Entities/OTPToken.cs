using AuthService.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities
{
    public class OTPToken
    {
        [Key]
        public Guid Id {  get; set; }

        [Required]
        [MaxLength(10)]
        public string Token { get; set; } = string.Empty;

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public DateTime TokenExpiry { get; set; }

        public bool IsUsed { get; set; }

        [Required]
        public PurposeEnum Purpose { get; set; }
    }
}
