using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderService.Application.DTOs.Order;
using OrderService.Application.Interfaces;
using System.Security.Claims;

namespace OrderService.API.Controllers
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderDTO dto)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var result = await _orderService.PlaceOrderAsync(dto, customerId);
            return CreatedAtAction(nameof(GetOrderById), new { id = result.Id }, result);
        }

        [HttpGet]
        public async Task<IActionResult> GetOrderHistory()
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var result = await _orderService.GetOrderHistoryAsync(customerId);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetOrderById(Guid id)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var result = await _orderService.GetOrderByIdAsync(id, customerId);
            return Ok(result);
        }

        [HttpPut("{id:guid}/cancel")]
        public async Task<IActionResult> CancelOrder(Guid id, [FromBody] CancelOrderDTO dto)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _orderService.CancelOrderAsync(id, customerId, dto);
            return NoContent();
        }

        [HttpPut("{id:guid}/status")]
        [Authorize(Roles = "Partner,Admin")]
        public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusDTO dto)
        {
            await _orderService.UpdateOrderStatusAsync(id, dto);
            return NoContent();
        }
    }
}
