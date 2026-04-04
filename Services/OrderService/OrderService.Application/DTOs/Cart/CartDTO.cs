using OrderService.Application.Services;
using OrderService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace OrderService.Application.DTOs.Cart
{
    public class CartDTO
    {
        public Guid RestaurantId { get; set; } 
        public CartStatus Status { get; set; } = CartStatus.Active; 
    }
}
