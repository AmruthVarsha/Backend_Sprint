using CatalogService.Application.DTOs.Category;
using CatalogService.Application.DTOs.MenuItem;

namespace CatalogService.Application.DTOs.Restaurant
{
    /// <summary>
    /// Full detail response for GET /restaurants/{id}.
    /// Includes address, cuisine tags, and the full categorised menu —
    /// everything the restaurant detail page needs in one call.
    /// </summary>
    public class RestaurantDetailDto
    {
        public Guid Id { get; set; }
        public string OwnerId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string OpeningTime { get; set; } = string.Empty;
        public string ClosingTime { get; set; } = string.Empty;
        public int PrepTimeMinutes { get; set; }
        public double Rating { get; set; }
        public int TotalRatings { get; set; }
        public bool IsActive { get; set; }
        public bool IsApproved { get; set; }

        public AddressDto Address { get; set; } = new();

        /// <summary>Cuisine tags shown at the top of the detail page.</summary>
        public List<string> Cuisines { get; set; } = new();

        /// <summary>Sidebar categories with their menu items nested inside.</summary>
        public List<CategoryWithItemsDto> Menu { get; set; } = new();
    }

    /// <summary>A category with its items — used only inside RestaurantDetailDto.Menu.</summary>
    public class CategoryWithItemsDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public List<MenuItemDto> Items { get; set; } = new();
    }
}
