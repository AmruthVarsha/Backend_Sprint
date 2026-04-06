using System.ComponentModel.DataAnnotations;

namespace AdminService.Domain.Entities
{
    public class AuditLog
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid OrderId { get; set; }

        [Required]
        [StringLength(255)]
        public string PerformedByAdminId { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Action { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Reason { get; set; } = string.Empty;

        [Required]
        public DateTime PerformedAt { get; set; } = DateTime.UtcNow;
    }
}
