using System;
using System.Collections.Generic;
using System.Text;

namespace OrderService.Application.DTOs.Checkout
{
    public class CheckoutReponseDTO
    {
        public ICollection<string> ItemNames { get; set; }
        public CheckoutAddressDTO Address { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class CheckoutAddressDTO
    {
        public string Street { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Pincode { get; set; }
    }
}
