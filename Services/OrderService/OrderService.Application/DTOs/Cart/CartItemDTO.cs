using System;
using System.Collections.Generic;
using System.Text;

namespace OrderService.Application.DTOs.Cart
{
    public class CartItemDTO
    {
        public Guid CartId { get; set; }
        public Guid MenuItemId { get; set; }
        public int Quantity { get; set; }
    }
}
