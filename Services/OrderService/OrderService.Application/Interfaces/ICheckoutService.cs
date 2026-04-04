using OrderService.Application.DTOs.Checkout;
using System;
using System.Collections.Generic;
using System.Text;

namespace OrderService.Application.Interfaces
{
    public interface ICheckoutService
    {
        public Task<CheckoutReponseDTO> Checkout(Guid cartId,string userId,Guid addressId,string token);
    }
}
