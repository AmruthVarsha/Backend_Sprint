using CatalogService.Application.DTOs.Restaurant;
using CatalogService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CatalogService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RestaurantController : ControllerBase
    {
        private readonly IRestaurantService restaurantService;

        public RestaurantController(IRestaurantService restaurantService)
        {
            this.restaurantService = restaurantService;
        }

        [HttpGet("restaurants")]
        public async Task<IActionResult> GetAll()
        {
            var restaurants = await restaurantService.GetAllAsync();
            return Ok(restaurants);
        }

        [HttpGet("restaurant/{id}")]
        public async Task<IActionResult> GetById([FromRoute] Guid id)
        {
            var restaurant = await restaurantService.GetByIdAsync(id);
            return Ok(restaurant);
        }

        [HttpGet("restaurant/{name}")]
        public async Task<IActionResult> GetByName([FromRoute] string name)
        {
            var restaurant = await restaurantService.SearchAsync(name);
            return Ok(restaurant);
        }

        [HttpGet("restaurant/near/{pincode}")]
        public async Task<IActionResult> GetByPincode([FromRoute] string pincode)
        {
            var restaurant = await restaurantService.GetByPincodeAsync(pincode);
            return Ok(restaurant);
        }

        [HttpGet("restaurant/cuisine/{id}")]
        public async Task<IActionResult> GetByCuisine([FromRoute] Guid id)
        {
            var restaurant = await restaurantService.GetByCuisineAsync(id);
            return Ok(restaurant);
        }

        [Authorize(Roles ="Partner")]
        [HttpPost("restaurant")]
        public async Task<IActionResult> CreateRestaurant([FromBody] CreateRestaurantDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var id = await restaurantService.CreateAsync(dto, userId);
            return Ok(id);
        }

        [Authorize(Roles = "Partner")]
        [HttpPut("restaurant/{id}")]
        public async Task<IActionResult> UpdateRestaurant([FromBody] UpdateRestaurantDto dto,Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await restaurantService.UpdateAsync(id, dto, userId);
            return Ok("Update Successfully");
        }

        [Authorize(Roles = "Partner,Admin")]
        [HttpDelete("restaurant/{id}")]
        public async Task<IActionResult> DeleteRestaurant([FromRoute] Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await restaurantService.DeleteAsync(id, userId);
            return Ok("Deletetion Succesfull");
        }

    }
}
