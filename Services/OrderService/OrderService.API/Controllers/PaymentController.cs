using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderService.Application.DTOs.Payment;
using OrderService.Application.Interfaces;

namespace OrderService.API.Controllers
{
    [ApiController]
    [Route("api/payments")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("simulate")]
        public async Task<IActionResult> SimulatePayment([FromBody] SimulatePaymentDTO dto)
        {
            var result = await _paymentService.SimulatePaymentAsync(dto);
            return Ok(result);
        }
    }
}
