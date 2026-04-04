using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderService.Application.Interfaces;
using System.Security.Claims;

namespace OrderService.API.Controllers
{
    [ApiController]
    [Route("api/checkout")]
    [Authorize]
    public class CheckoutController : ControllerBase
    {
        private readonly ICheckoutService _checkoutService;

        public CheckoutController(ICheckoutService checkoutService)
        {
            _checkoutService = checkoutService;
        }

        [HttpGet("{cartId:guid}")]
        public async Task<IActionResult> Checkout(Guid cartId, [FromQuery] Guid addressId)
        {
            var token = Request.Headers["Authorization"].ToString();
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var result = await _checkoutService.Checkout(cartId, userId, addressId,token);
            return Ok(result);
        }
    }
}
