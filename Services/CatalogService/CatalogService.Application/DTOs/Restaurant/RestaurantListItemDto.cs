using CatalogService.Application.DTOs.Restaurant;

namespace CatalogService.Application.DTOs.Restaurant
{

    public class RestaurantListItemDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public double Rating { get; set; }
        public int TotalRatings { get; set; }
        public int PrepTimeMinutes { get; set; }
        public bool IsActive { get; set; }
        public string City { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;

        public List<string> Cuisines { get; set; } = new();

        public string OpeningTime { get; set; } = string.Empty;
        public string ClosingTime { get; set; } = string.Empty;
    }
}
