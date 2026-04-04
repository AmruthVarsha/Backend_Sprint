using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OrderService.Application.DTOs.Cart
{
    public class CartItemResponseDTO
    {
        public Guid Id { get; set; }

        [Required]
        public Guid CartId { get; set; }

        [Required]
        public Guid MenuItemId { get; set; }

        [Required]
        [StringLength(100)]
        public string MenuItemName { get; set; } = string.Empty;

        [Required]
        [Range(0.01, 10000.00)]
        public decimal UnitPrice { get; set; }

        [Required]
        [Range(1, 100)]
        public int Quantity { get; set; }
    }
}
