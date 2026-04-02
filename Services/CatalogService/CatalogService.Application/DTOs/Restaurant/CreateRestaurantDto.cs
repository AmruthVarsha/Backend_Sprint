using System.ComponentModel.DataAnnotations;

namespace CatalogService.Application.DTOs.Restaurant
{
    /// <summary>Request body for POST /restaurants (Partner only).</summary>
    public class CreateRestaurantDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [StringLength(300)]
        public string? Description { get; set; }

        public string? LogoUrl { get; set; }

        [Required]
        [RegularExpression(@"^[0-9]{10}$", ErrorMessage = "Phone number must be exactly 10 digits.")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        /// <summary>Format: "HH:mm" (24-hour).</summary>
        [Required]
        public string OpeningTime { get; set; } = string.Empty;

        /// <summary>Format: "HH:mm" (24-hour).</summary>
        [Required]
        public string ClosingTime { get; set; } = string.Empty;

        [Required]
        [Range(1, 120, ErrorMessage = "Prep time must be between 1 and 120 minutes.")]
        public int PrepTimeMinutes { get; set; }

        [Required]
        public CreateAddressDto Address { get; set; } = new();

        /// <summary>Names of cuisines this restaurant serves (e.g. "Indian", "Chinese").</summary>
        [MinLength(1, ErrorMessage = "At least one cuisine name is required.")]
        public List<string> CuisineNames { get; set; } = new();
    }

    /// <summary>Address sub-object used inside CreateRestaurantDto.</summary>
    public class CreateAddressDto
    {
        [Required]
        [StringLength(100)]
        public string Street { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string City { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string State { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "Pincode must be exactly 6 digits.")]
        public string Pincode { get; set; } = string.Empty;
    }
}
