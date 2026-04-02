using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CatalogService.Domain.Entities
{
    public class Restaurant
    {
        [Key]
        public Guid Id { get; set; }

        public string OwnerId { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(300)]
        public string? Description { get; set; }

        public string? LogoUrl { get; set; }

        [Required]
        [RegularExpression(@"^[0-9]{10}$")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public TimeOnly OpeningTime { get; set; }

        [Required]
        public TimeOnly ClosingTime { get; set; }

        [Required]
        public int PrepTimeMinutes { get; set; }

        [Range(0.0, 5.0)]
        public double Rating { get; set; } = 0.0;

        public int TotalRatings { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public bool IsApproved { get; set; } = false;

        public Address Address { get; set; } = null!;
        public ICollection<ServiceArea> ServiceAreas { get; set; } = new List<ServiceArea>();
        public ICollection<Category> Categories { get; set; } = new List<Category>();
        public ICollection<RestaurantCuisine> RestaurantCuisines { get; set; } = new List<RestaurantCuisine>();
    }
}