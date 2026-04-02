using System.ComponentModel.DataAnnotations;

namespace CatalogService.Application.DTOs.MenuItem
{
    /// <summary>Request body for POST /menuitems (Partner only).</summary>
    public class CreateMenuItemDto
    {
        [Required]
        public Guid RestaurantId { get; set; }

        /// <summary>Name of the category within this restaurant (e.g. "Starters").</summary>
        [Required]
        [StringLength(50, MinimumLength = 1)]
        public string CategoryName { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        [StringLength(300)]
        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0.")]
        public decimal Price { get; set; }

        public bool IsVeg { get; set; }

        [Range(1, 120, ErrorMessage = "Prep time must be between 1 and 120 minutes.")]
        public int PrepTimeMinutes { get; set; }
    }
}
