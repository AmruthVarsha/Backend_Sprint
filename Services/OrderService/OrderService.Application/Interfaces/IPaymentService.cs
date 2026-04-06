using OrderService.Application.DTOs.Payment;

namespace OrderService.Application.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentResponseDTO> SimulatePaymentAsync(SimulatePaymentDTO dto);
        Task<PaymentResponseDTO> CompletePaymentAsync(Guid orderId);
        Task<PaymentResponseDTO> GetPaymentStatusAsync(Guid orderId);
    }
}
