using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuthService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly IAuthService authService;
        public AuthController(IAuthService authService)
        {
            this.authService = authService;
        }

        private string GetIpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
            {
                return Request.Headers["X-Forwarded-For"];
            }
            return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "Unknown";
        }

        private void SetRefreshTokenCookie(string token)
        {
            CookieOptions cookieOptions = new CookieOptions()
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            };

            Response.Cookies.Append("refreshToken", token, cookieOptions);
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegistrationDTO model)
        {
            await authService.RegisterAsync(model);
            return Ok();
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody]  LoginDTO model)
        {
            var response = await authService.LoginAsync(model,GetIpAddress());

            if (response.Token == null)
            {
                return Ok("Please continue for two factor verification");
            }

            SetRefreshTokenCookie(response.RefreshToken.Token);
            return Ok(response);
        }

        [HttpPost("Refresh")]
        public async Task<IActionResult> Refresh()
        {
            var incomingToken = Request.Cookies["refreshToken"];

            var response = await authService.RefreshAsync(incomingToken,GetIpAddress());

            SetRefreshTokenCookie(response.RefreshToken.Token);
            return Ok(response);
        }

        [HttpPost("Logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var incomingToken = Request.Cookies["refreshToken"];
            await authService.LogoutAsync(incomingToken,GetIpAddress());
            Response.Cookies.Delete("refreshToken");
            return Ok("Logged out");
        }

        [Authorize]
        [HttpPost("SendEmailConfirmationOTP")]
        public async Task<IActionResult> SendEmailConfirmationOTP()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            await authService.SendEmailConfirmationOtpAsync(email);
            return Ok("Otp send if user exists");
        }

        [Authorize]
        [HttpPost("ConfirmEmail")]
        public async Task<IActionResult> ConfirmEmail([FromBody] string otp)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            await authService.ConfirmEmailAsync(email, otp);
            return Ok();
        }

        [Authorize]
        [HttpPost("SetTwoFactorAuth")]
        public async Task<IActionResult> SetTwoFactorAuth(bool enable)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            await authService.SetTwoFactorAsync(email, enable);
            return Ok();
        }

        [HttpPost("TwoFactorAuth")]
        public async Task<IActionResult> TwoFactorAuth([FromBody] string email)
        {
            await authService.SendTwoFactorOtpAsync(email);
            return Ok("OTP sent if user exits");
        }

        [HttpPost("VerifyOTP")]
        public async Task<IActionResult> VerifyOTP([FromBody] ConfirmEmailDTO model)
        {
            var response = await authService.VerifyTwoFactorOtpAsync(model, GetIpAddress());
            SetRefreshTokenCookie(response.RefreshToken.Token);
            return Ok(response);
        }



        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] string email)
        {
            await authService.ForgotPasswordAsync(email);

            return Ok("Reset token sent is user Exists");
        }

        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO model)
        {
            await authService.ResetPasswordAsync(model);
            return Ok();
        }

        [Authorize]
        [HttpPost("ChangePassword")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO model)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            await authService.ChangePasswordAsync(email, model);
            return Ok();
        }

        [Authorize]
        [HttpGet("Me")]
        public async Task<IActionResult> Me()
        {
            
            var email = User.FindFirst(ClaimTypes.Email)?.Value;

            var response = await authService.GetProfileAsync(email);
            return Ok(response);
        }

        [Authorize(Roles = ("Admin"))]
        [HttpPut("PromoteRole")]
        public async Task<IActionResult> PromoteRole([FromBody] PromoteRoleDTO model)
        {
            var adminMail = User.FindFirst(ClaimTypes.Email)?.Value;

            await authService.PromoteRoleAsync(adminMail, model);
            return Ok();
            
        }

        [Authorize(Roles = ("Admin"))]
        [HttpPut("ChangeAccountStatus")]
        public async Task<IActionResult> ChangeAccountStatus([FromBody] StatusChangeDTO model)
        {
            await authService.ChangeAccountStatusAsync(model, GetIpAddress());
            return Ok("Updated user status");
        }
    }
}
