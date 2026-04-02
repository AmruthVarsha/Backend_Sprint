using CatalogService.Application.DTOs.Category;
using CatalogService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CatalogService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        /// <summary>Returns all categories for a restaurant's menu sidebar. Public.</summary>
        [HttpGet("restaurant/{restaurantId:guid}")]
        public async Task<IActionResult> GetByRestaurant([FromRoute] Guid restaurantId)
        {
            var categories = await _categoryService.GetByRestaurantIdAsync(restaurantId);
            return Ok(categories);
        }

        /// <summary>Creates a new category inside a restaurant. Partner only.</summary>
        [Authorize(Roles = "Partner")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var id = await _categoryService.CreateAsync(dto, userId!);
            return Ok(id);
        }

        /// <summary>Updates a category. Requestor must own the parent restaurant. Partner only.</summary>
        [Authorize(Roles = "Partner")]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateCategoryDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _categoryService.UpdateAsync(id, dto, userId!);
            return Ok("Category updated successfully.");
        }

        /// <summary>Deletes a category and all its menu items. Partner only.</summary>
        [Authorize(Roles = "Partner")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _categoryService.DeleteAsync(id, userId!);
            return Ok("Category deleted successfully.");
        }
    }
}
