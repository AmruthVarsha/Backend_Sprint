using System;
using System.Collections.Generic;
using System.Text;

namespace OrderService.Domain.ExternalDTO
{
    public class RestaurantDTO
    {
        public Guid Id { get; set; }
        public Guid OwnerId { get; set; }
        public string Name { get; set; }
    }
}
