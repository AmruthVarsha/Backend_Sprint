using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderService.Application.DTOs.Cart;
using OrderService.Application.Interfaces;
using System.Security.Claims;

namespace OrderService.API.Controllers
{
    [ApiController]
    [Route("api/carts")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetCartInfo(Guid id)
        {
            var result = await _cartService.GetCartInfo(id);
            return Ok(result);
        }

        [HttpGet("{id:guid}/items")]
        public async Task<IActionResult> GetCartItems(Guid id)
        {
            var result = await _cartService.GetCartItems(id);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCart([FromBody] CartDTO dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var cartId = await _cartService.AddCartAsync(dto,userId);
            return CreatedAtAction(nameof(GetCartInfo), new { id = cartId }, new { cartId });
        }

        [HttpPost("{id:guid}/items")]
        public async Task<IActionResult> AddCartItem(Guid id, [FromBody] CartItemDTO dto)
        {
            dto.CartId = id;
            var result = await _cartService.AddCartItem(dto);
            return Ok(result);
        }

        [HttpPut("{id:guid}/items/{itemId:guid}")]
        public async Task<IActionResult> UpdateCartItem(Guid id, Guid itemId, [FromBody] UpdateCartItemDTO dto)
        {
            dto.Id = itemId;
            dto.CartId = id;
            var result = await _cartService.UpdateCartItem(dto);
            return Ok(result);
        }

        [HttpDelete("{id:guid}/items/{itemId:guid}")]
        public async Task<IActionResult> DeleteCartItem(Guid id, Guid itemId)
        {
            await _cartService.DeleteCartItem(itemId);
            return NoContent();
        }
    }
}
