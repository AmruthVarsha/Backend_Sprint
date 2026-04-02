using CatalogService.Application.DTOs.ServiceArea;
using CatalogService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CatalogService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceAreaController : ControllerBase
    {
        private readonly IServiceAreaService _serviceAreaService;

        public ServiceAreaController(IServiceAreaService serviceAreaService)
        {
            _serviceAreaService = serviceAreaService;
        }

        /// <summary>Returns all pincodes a restaurant delivers to. Partner only.</summary>
        [Authorize(Roles = "Partner")]
        [HttpGet("{restaurantId:guid}")]
        public async Task<IActionResult> GetByRestaurant([FromRoute] Guid restaurantId)
        {
            var areas = await _serviceAreaService.GetByRestaurantIdAsync(restaurantId);
            return Ok(areas);
        }

        /// <summary>Adds a pincode to a restaurant's service area. Partner only.</summary>
        [Authorize(Roles = "Partner")]
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] AddServiceAreaDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var id = await _serviceAreaService.AddAsync(dto, userId!);
            return Ok(id);
        }

        /// <summary>Removes a pincode from a restaurant's service area. Partner only.</summary>
        [Authorize(Roles = "Partner")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Remove([FromRoute] Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _serviceAreaService.RemoveAsync(id, userId!);
            return Ok("Service area pincode removed.");
        }
    }
}
