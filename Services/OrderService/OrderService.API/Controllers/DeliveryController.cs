using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderService.Application.DTOs.Delivery;
using OrderService.Application.Interfaces;
using System.Security.Claims;

namespace OrderService.API.Controllers
{
    [ApiController]
    [Route("api/delivery")]
    [Authorize(Roles = "DeliveryAgent")]
    public class DeliveryController : ControllerBase
    {
        private readonly IDeliveryService _deliveryService;

        public DeliveryController(IDeliveryService deliveryService)
        {
            _deliveryService = deliveryService;
        }

        [HttpGet("assignments")]
        public async Task<IActionResult> GetAssignments()
        {
            var agentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var result = await _deliveryService.GetAssignmentsAsync(agentId);
            return Ok(result);
        }

        [HttpPut("assignments/{id:guid}/status")]
        public async Task<IActionResult> UpdateDeliveryStatus(Guid id, [FromBody] UpdateDeliveryStatusDTO dto)
        {
            var agentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var result = await _deliveryService.UpdateDeliveryStatusAsync(id, agentId, dto);
            return Ok(result);
        }
    }
}
