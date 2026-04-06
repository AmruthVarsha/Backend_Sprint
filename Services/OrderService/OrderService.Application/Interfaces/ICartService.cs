using OrderService.Application.DTOs.Cart;
using OrderService.Application.Exceptions;

namespace OrderService.Application.Interfaces
{
    public interface ICartService
    {
        Task<IEnumerable<DisplayCartDTO>> GetCartItems(Guid id);
        Task<CartResponseDTO> GetCartInfo(Guid id);
        Task<IEnumerable<CartResponseDTO>> GetUserActiveCarts(string userId);
        Task<Guid> AddCartAsync(CartDTO cartDTO,string userId);
        Task<CartItemResponseDTO> AddCartItem(CartItemDTO cartItemDTO);
        Task<CartItemResponseDTO> UpdateCartItem(UpdateCartItemDTO cartItemDTO);
        Task<bool> DeleteCartItem(Guid id,Guid cartId,string userId);
    }
}
