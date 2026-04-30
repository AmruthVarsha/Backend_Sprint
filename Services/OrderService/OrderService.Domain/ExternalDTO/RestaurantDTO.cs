using System;

namespace OrderService.Domain.ExternalDTO
{
    /// <summary>
    /// Matches the Address object returned inside the Catalog service's restaurant response.
    /// </summary>
    public class RestaurantAddressDTO
    {
        public Guid Id { get; set; }
        public string Street { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;

        /// <summary>
        /// Formats the address as a single string for snapshotting into orders.
        /// </summary>
        public override string ToString() =>
            $"{Street}, {City}, {State} – {Pincode}";
    }

    public class RestaurantDTO
    {
        public Guid Id { get; set; }
        public string OwnerId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Nested address object from the Catalog service response.
        /// </summary>
        public RestaurantAddressDTO? Address { get; set; }

        public string OpeningTime { get; set; } = string.Empty;
        public string ClosingTime { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsApproved { get; set; }
        public List<CategoryWithItemsDTO> Menu { get; set; } = new();

        /// <summary>
        /// Convenience helper to get a flat address string for snapshotting.
        /// </summary>
        public string FormattedAddress =>
            Address?.ToString() ?? string.Empty;
    }

    public class CategoryWithItemsDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public List<MenuItemDTO> Items { get; set; } = new();
    }
}
