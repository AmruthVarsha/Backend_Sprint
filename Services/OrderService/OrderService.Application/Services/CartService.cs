using OrderService.Application.DTOs.Cart;
using OrderService.Application.Exceptions;
using OrderService.Application.Interfaces;
using OrderService.Domain.Entities;
using OrderService.Domain.Enums;
using OrderService.Domain.Interfaces;

namespace OrderService.Application.Services
{
    public class CartService : ICartService
    {
        private readonly ICartItemRepository _cartItemRepository;
        private readonly ICartRepository _cartRepository;
        private readonly ICatalogRepository _catalogRepository;

        public CartService(ICartItemRepository cartItemRepository, ICartRepository cartRepository, ICatalogRepository catalogRepository)
        {
            _cartItemRepository = cartItemRepository;
            _cartRepository = cartRepository;
            _catalogRepository = catalogRepository;
        }

        public async Task<IEnumerable<DisplayCartDTO>> GetCartItems(Guid id)
        {
            var cart = await _cartRepository.GetById(id);
            if (cart == null)
                throw new NotFoundException("Cart", id);

            return cart.CartItems.Select(ci => new DisplayCartDTO
            {
                Id = ci.Id,
                MenuItemId = ci.MenuItemId,
                MenuItemName = ci.MenuItemName,
                Quantity = ci.Quantity,
                UnitPrice = ci.UnitPrice,
                TotalPrice = ci.Quantity * ci.UnitPrice
            });
        }

        public async Task<CartResponseDTO> GetCartInfo(Guid id)
        {
            var cart = await _cartRepository.GetById(id);
            if (cart == null)
                throw new NotFoundException("Cart", id);

            return new CartResponseDTO
            {
                Id = cart.Id,
                RestaurantId = cart.RestaurantId,
                CustomerId = cart.CustomerId,
                Status = cart.Status
            };
        }

        public async Task<Guid> AddCartAsync(CartDTO cartDTO,string userId)
        {
            var restaurant = await _catalogRepository.GetRestaurantById(cartDTO.RestaurantId);
            if (restaurant == null)
                throw new NotFoundException("Restaurant", cartDTO.RestaurantId);

            var cart = new Cart
            {
                Id = Guid.NewGuid(),
                RestaurantId = cartDTO.RestaurantId,
                CustomerId = userId,
                Status = CartStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _cartRepository.AddAsync(cart);
            return cart.Id;
        }

        public async Task<CartItemResponseDTO> AddCartItem(CartItemDTO cartItemDTO)
        {
            var menuItem = await _catalogRepository.GetItemById(cartItemDTO.MenuItemId);
            if (menuItem == null)
                throw new NotFoundException("MenuItem", cartItemDTO.MenuItemId);

            if (!menuItem.IsAvailable)
                throw new BadRequestException("The requested menu item is currently unavailable.");

            var cart = await _cartRepository.GetById(cartItemDTO.CartId);
            if (cart == null)
                throw new NotFoundException("Cart", cartItemDTO.CartId);

            if (cart.RestaurantId != menuItem.RestaurantId)
                throw new BadRequestException("Menu item does not belong to the cart's restaurant.");

            if (cart.Status != CartStatus.Active)
                throw new BadRequestException("Cannot add items to an inactive cart.");

            var cartItem = new CartItem
            {
                Id = Guid.NewGuid(),
                MenuItemId = cartItemDTO.MenuItemId,
                MenuItemName = menuItem.Name,
                CartId = cartItemDTO.CartId,
                Quantity = cartItemDTO.Quantity,
                UnitPrice = menuItem.Price
            };

            await _cartItemRepository.AddAsync(cartItem);

            return new CartItemResponseDTO
            {
                Id = cartItem.Id,
                MenuItemId = cartItem.MenuItemId,
                MenuItemName = cartItem.MenuItemName,
                CartId = cartItem.CartId,
                Quantity = cartItem.Quantity,
                UnitPrice = cartItem.UnitPrice
            };
        }

        public async Task<CartItemResponseDTO> UpdateCartItem(UpdateCartItemDTO cartItemDTO)
        {
            var cartItem = await _cartItemRepository.GetById(cartItemDTO.Id);
            if (cartItem == null)
                throw new NotFoundException("CartItem", cartItemDTO.Id);

            cartItem.Quantity = cartItemDTO.Quantity;
            await _cartItemRepository.UpdateAsync(cartItem);

            return new CartItemResponseDTO
            {
                Id = cartItem.Id,
                MenuItemId = cartItem.MenuItemId,
                MenuItemName = cartItem.MenuItemName,
                CartId = cartItem.CartId,
                Quantity = cartItem.Quantity,
                UnitPrice = cartItem.UnitPrice
            };
        }

        public async Task<bool> DeleteCartItem(Guid id)
        {
            var item = await _cartItemRepository.GetById(id);
            if (item == null)
                throw new NotFoundException("CartItem", id);

            var cartId = item.CartId;
            await _cartItemRepository.DeleteAsync(id);

            var remaining = await _cartItemRepository.GetAllByCartId(cartId);
            if (!remaining.Any())
            {
                var cart = await _cartRepository.GetById(cartId);
                if (cart != null)
                {
                    cart.Status = CartStatus.Abandoned;
                    cart.UpdatedAt = DateTime.UtcNow;
                    await _cartRepository.UpdateAsync(cart);
                }
            }

            return true;
        }
    }
}
