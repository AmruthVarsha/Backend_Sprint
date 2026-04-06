using System.ComponentModel.DataAnnotations;
using AdminService.Domain.Enums;

namespace AdminService.Domain.Entities
{
    public class OrderSummary
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid OrderId { get; set; }

        [Required]
        [StringLength(255)]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string RestaurantName { get; set; } = string.Empty;

        [Required]
        [Range(0, double.MaxValue)]
        public decimal TotalAmount { get; set; }

        [Required]
        public OrderStatus Status { get; set; }

        [Required]
        public DateTime PlacedAt { get; set; }

        [Required]
        public DateTime LastUpdatedAt { get; set; }
    }
}
