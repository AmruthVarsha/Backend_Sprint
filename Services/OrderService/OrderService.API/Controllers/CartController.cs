using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderService.Application.DTOs.Cart;
using OrderService.Application.Interfaces;
using System.Security.Claims;

namespace OrderService.API.Controllers
{
    [ApiController]
    [Route("api/carts")]
    [Authorize(Roles = "Customer")]
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

        [HttpGet("user/active")]
        public async Task<IActionResult> GetUserActiveCarts()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _cartService.GetUserActiveCarts(userId);
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

        [HttpPost("items")]
        public async Task<IActionResult> AddCartItem([FromBody] CartItemDTO dto)
        {
            var result = await _cartService.AddCartItem(dto);
            return Ok(result);
        }

        [HttpPut("items")]
        public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartItemDTO dto)
        {

            var result = await _cartService.UpdateCartItem(dto);
            return Ok(result);
        }

        [HttpDelete("items/{itemId:guid}/{cartId:guid}")]
        public async Task<IActionResult> DeleteCartItem(Guid itemId,Guid cartId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _cartService.DeleteCartItem(itemId,cartId,userId);
            return NoContent();
        }
    }
}
