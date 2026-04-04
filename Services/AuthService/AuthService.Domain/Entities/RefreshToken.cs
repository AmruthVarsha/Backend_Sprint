using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities
{
    public class RefreshToken
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string Token { get; set; } 

        [Required]
        public DateTime ExpiryDate { get; set; }

        public DateTime CreateAt { get; set; } = DateTime.UtcNow;

        public bool IsRevoked { get; set; }

        [Required]
        [MaxLength(50)]
        public string CreateByIp { get; set; }

        [MaxLength(50)]
        public string? RevokedIp { get; set; }

        [Required]
        public string UserId { get; set; }
    }
}
