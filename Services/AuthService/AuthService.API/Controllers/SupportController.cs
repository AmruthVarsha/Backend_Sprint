using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupportController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public SupportController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitSupportRequest([FromBody] SupportRequestDto request)
        {
            if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Concern))
            {
                return BadRequest(new { message = "All fields are required." });
            }

            var subject = $"New Support Concern from {request.Name}";
            var body = $@"
                <h3>Support Request Details</h3>
                <p><strong>Name:</strong> {request.Name}</p>
                <p><strong>Email:</strong> {request.Email}</p>
                <p><strong>Concern:</strong> {request.Concern}</p>
            ";

            try
            {
                // Send to the admin email specified by the user
                await _emailService.SendEmailAsync("amruthvarsha2005@gmail.com", subject, body);
                
                // Also send a confirmation email to the user
                var confirmationSubject = "We received your support request";
                var confirmationBody = $@"
                    <h3>Hi {request.Name},</h3>
                    <p>Thank you for contacting Crave support. We have received your concern:</p>
                    <p><em>{request.Concern}</em></p>
                    <p>Our team will get back to you shortly.</p>
                ";
                await _emailService.SendEmailAsync(request.Email, confirmationSubject, confirmationBody);

                return Ok(new { message = "Support request submitted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to send email.", error = ex.Message });
            }
        }
    }

    public class SupportRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Concern { get; set; } = string.Empty;
    }
}
