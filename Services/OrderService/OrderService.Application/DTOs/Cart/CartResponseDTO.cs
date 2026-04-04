using OrderService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace OrderService.Application.DTOs.Cart
{
    public class CartResponseDTO
    {
        public Guid Id { get; set; }
        public Guid RestaurantId { get; set; }
        public string CustomerId { get; set; }
        public CartStatus Status { get; set; }
    }
}
