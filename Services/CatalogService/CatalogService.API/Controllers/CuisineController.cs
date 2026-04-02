using CatalogService.Application.DTOs.Cuisine;
using CatalogService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CatalogService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CuisineController : ControllerBase
    {
        private readonly ICuisineService _cuisineService;

        public CuisineController(ICuisineService cuisineService)
        {
            _cuisineService = cuisineService;
        }

        /// <summary>Returns all cuisines for chips/tiles on the home page. Public.</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var cuisines = await _cuisineService.GetAllAsync();
            return Ok(cuisines);
        }

        /// <summary>Creates a new cuisine. Admin only.</summary>
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCuisineDto dto)
        {
            var id = await _cuisineService.CreateAsync(dto);
            return Ok(id);
        }

        /// <summary>Updates an existing cuisine. Admin only.</summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateCuisineDto dto)
        {
            await _cuisineService.UpdateAsync(id, dto);
            return Ok("Cuisine updated successfully.");
        }

        /// <summary>Deletes a cuisine. Fails if it is still linked to any restaurant. Admin only.</summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            await _cuisineService.DeleteAsync(id);
            return Ok("Cuisine deleted successfully.");
        }
    }
}
