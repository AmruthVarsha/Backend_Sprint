using OrderService.Domain.Enums;

namespace OrderService.Application.DTOs.Payment
{
    public class PaymentResponseDTO
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public PaymentMethod Method { get; set; }
        public PaymentStatus Status { get; set; }
        public decimal Amount { get; set; }
        public string? TransactionReference { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
