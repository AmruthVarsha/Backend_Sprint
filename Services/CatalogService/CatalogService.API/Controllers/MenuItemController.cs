using CatalogService.Application.DTOs.MenuItem;
using CatalogService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CatalogService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuItemController : ControllerBase
    {
        private readonly IMenuItemService _menuItemService;

        public MenuItemController(IMenuItemService menuItemService)
        {
            _menuItemService = menuItemService;
        }

        /// <summary>Returns all menu items for a restaurant. Public.</summary>
        [HttpGet("restaurant/{restaurantId:guid}")]
        public async Task<IActionResult> GetByRestaurant([FromRoute] Guid restaurantId)
        {
            var items = await _menuItemService.GetByRestaurantIdAsync(restaurantId);
            return Ok(items);
        }

        /// <summary>Returns all menu items belonging to a category. Public.</summary>
        [HttpGet("category/{categoryId:guid}")]
        public async Task<IActionResult> GetByCategory([FromRoute] Guid categoryId)
        {
            var items = await _menuItemService.GetByCategoryIdAsync(categoryId);
            return Ok(items);
        }

        /// <summary>Returns a single menu item by ID. Public.</summary>
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById([FromRoute] Guid id)
        {
            var item = await _menuItemService.GetByIdAsync(id);
            return Ok(item);
        }

        /// <summary>Creates a new menu item. Partner only.</summary>
        [Authorize(Roles = "Partner")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMenuItemDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var id = await _menuItemService.CreateAsync(dto, userId!);
            return Ok(id);
        }

        /// <summary>Updates a menu item. Requestor must own the parent restaurant. Partner only.</summary>
        [Authorize(Roles = "Partner")]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateMenuItemDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _menuItemService.UpdateAsync(id, dto, userId!);
            return Ok("Menu item updated successfully.");
        }

        /// <summary>Deletes a menu item. Requestor must own the parent restaurant. Partner only.</summary>
        [Authorize(Roles = "Partner")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _menuItemService.DeleteAsync(id, userId!);
            return Ok("Menu item deleted successfully.");
        }
    }
}
