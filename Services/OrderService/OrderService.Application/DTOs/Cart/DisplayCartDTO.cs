using System;
using System.Collections.Generic;
using System.Text;

namespace OrderService.Application.DTOs.Cart
{
    public class DisplayCartDTO
    {
        public Guid Id { get; set; }
        public Guid MenuItemId { get; set; }
        public string MenuItemName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
