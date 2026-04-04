using System;
using System.Collections.Generic;
using System.Text;

namespace OrderService.Domain.ExternalDTO
{
    public class MenuItemDTO
    {
        public Guid Id { get; set; }
        public Guid RestaurantId { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public bool IsAvailable { get; set; }
    }
}
