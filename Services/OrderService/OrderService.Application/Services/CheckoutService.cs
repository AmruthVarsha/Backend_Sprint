using OrderService.Application.DTOs.Cart;
using OrderService.Application.DTOs.Checkout;
using OrderService.Application.Exceptions;
using OrderService.Application.Interfaces;
using OrderService.Domain.Interfaces;

namespace OrderService.Application.Services
{
    public class CheckoutService : ICheckoutService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IAuthRepository _authRepository;

        public CheckoutService(ICartRepository cartRepository, IAuthRepository authRepository)
        {
            _cartRepository = cartRepository;
            _authRepository = authRepository;
        }

        public async Task<CheckoutReponseDTO> Checkout(Guid cartId, string userId, Guid addressId,string token)
        {
            var cart = await _cartRepository.GetById(cartId);
            if (cart == null)
                throw new NotFoundException("Cart", cartId);

            if (cart.CustomerId != userId)
                throw new ForbiddenException("You do not have access to this cart.");

            if (!cart.CartItems.Any())
                throw new BadRequestException("Cart has no items.");

            var address = await _authRepository.GetAddressById(addressId,token);
            if (address == null)
                throw new NotFoundException("Address", addressId);

            if (address.UserId != userId)
                throw new ForbiddenException("The selected address does not belong to you.");

            var items = cart.CartItems.Select(ci => new DisplayCartDTO
            {
                Id = ci.Id,
                MenuItemId = ci.MenuItemId,
                MenuItemName = ci.MenuItemName,
                Quantity = ci.Quantity,
                UnitPrice = ci.UnitPrice,
                TotalPrice = ci.Quantity * ci.UnitPrice
            });

            return new CheckoutReponseDTO
            {
                ItemNames = items.Select(i => i.MenuItemName).ToList(),
                Address = new CheckoutAddressDTO
                {
                    Street = address.Street,
                    City = address.City,
                    State = address.State,
                    Pincode = address.Pincode
                },
                TotalAmount = items.Sum(i => i.TotalPrice)
            };
        }
    }
}
