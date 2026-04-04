using AuthService.Application.DTOs;
using AuthService.Application.Exceptions;
using AuthService.Application.Interfaces;
using Azure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AuthService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IAddressService _addressService;
        
        public UserController(IUserService userService,IAddressService addressService)
        {
            _userService = userService;
            _addressService = addressService;
        }

        private string GetIpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
            {
                var forwarded = Request.Headers["X-Forwarded-For"].ToString();
                return forwarded.Split(',')[0].Trim();
            }
            return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "Unknown";
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) throw new UnauthorizedException("Access Denied");

            var profile = await _userService.GetProfileAsync(userId);
            return Ok(profile);
        }

        [Authorize]
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDTO model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) throw new UnauthorizedException("Access Denied");

            await _userService.UpdateProfileAsync(userId, model);
            
            return Ok("Updation Succesfull");
        }

        [Authorize]
        [HttpPut("Deactivate")]
        public async Task<IActionResult> DeactivateAccount()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) throw new UnauthorizedException("Access Denied");

            await _userService.DeactivateAccountAsync(userId, GetIpAddress());
            
            return Ok("Deactivation Succesfull");
        }

        [Authorize]
        [HttpPut("Reactivate")]
        public async Task<IActionResult> ReactivateAccount()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) throw new UnauthorizedException("Access Denied");

            await _userService.ReactivateAccountAsync(userId);
            
            return Ok("Account reactivated successfully");
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("Address/{id}")]
        public async Task<IActionResult> GetAddressById([FromRoute] Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) throw new UnauthorizedException("Access Denied");

            var response = await _addressService.GetById(id);
            return Ok(response);
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("Addresses")]
        public async Task<IActionResult> GetAddressByUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) throw new UnauthorizedException("Access Denied");

            var response = await _addressService.GetAllByUserId(userId);
            return Ok(response);
        }

        [Authorize(Roles = "Customer")]
        [HttpPost("Address")]
        public async Task<IActionResult> AddAddress([FromBody] AddressDTO dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) throw new UnauthorizedException("Access Denied");

            var response = await _addressService.AddAddress(dto,userId);
            return Ok(response);
        }

        [Authorize(Roles = "Customer")]
        [HttpPut("Address")]
        public async Task<IActionResult> AddAddress([FromBody] UpdateAddressDTO dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) throw new UnauthorizedException("Access Denied");

            var response = await _addressService.UpdateAddress(dto, userId);
            return Ok(response);
        }

        [Authorize(Roles = "Customer")]
        [HttpDelete("Address/{id}")]
        public async Task<IActionResult> AddAddress([FromRoute] Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) throw new UnauthorizedException("Access Denied");

            var response = await _addressService.DeleteAddress(id, userId);
            return Ok(response);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("AllUsers")]
        public async Task<IActionResult> GetAllUsers([FromQuery] string? role, [FromQuery] bool? isActive)
        {
            var userList = await _userService.GetAllUsersAsync(role, isActive);

            var result = new List<object>();
            foreach (var u in userList)
            {
                var roles = await _userService.GetRolesAsync(u.Id);
                result.Add(new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    PhoneNumber = u.PhoneNo,
                    u.IsActive,
                    u.EmailConfirmed,
                    Roles = roles != null && roles.Any() ? string.Join(",", roles) : string.Empty
                });
            }

            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            var roles = await _userService.GetRolesAsync(user.Id);

            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                PhoneNumber = user.PhoneNo,
                user.IsActive,
                user.EmailConfirmed,
                Roles = roles != null && roles.Any() ? string.Join(",", roles) : string.Empty
            });
        }
    }
}
