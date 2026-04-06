using OrderService.Application.DTOs.Payment;
using OrderService.Application.Exceptions;
using OrderService.Application.Interfaces;
using OrderService.Domain.Entities;
using OrderService.Domain.Enums;
using OrderService.Domain.Interfaces;

namespace OrderService.Application.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IOrderRepository _orderRepository;
        private static readonly Random _random = new();

        public PaymentService(IPaymentRepository paymentRepository, IOrderRepository orderRepository)
        {
            _paymentRepository = paymentRepository;
            _orderRepository = orderRepository;
        }

        public async Task<PaymentResponseDTO> SimulatePaymentAsync(SimulatePaymentDTO dto)
        {
            var order = await _orderRepository.GetById(dto.OrderId);
            if (order == null)
                throw new NotFoundException("Order", dto.OrderId);

            var existing = await _paymentRepository.GetByOrderId(dto.OrderId);

            if (existing != null && existing.Status == PaymentStatus.Completed)
                throw new ConflictException("Payment already completed for this order.");

            if (existing == null)
            {
                var payment = new Payment
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    Method = dto.Method,
                    Amount = order.TotalAmount,
                    Status = PaymentStatus.Pending,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _paymentRepository.AddAsync(payment);
                return MapToDTO(payment);
            }

            return MapToDTO(existing);
        }

        public async Task<PaymentResponseDTO> CompletePaymentAsync(Guid orderId)
        {
            var order = await _orderRepository.GetById(orderId);
            if (order == null)
                throw new NotFoundException("Order", orderId);

            var payment = await _paymentRepository.GetByOrderId(orderId);
            if (payment == null)
                throw new NotFoundException("Payment", orderId);

            if (payment.Status == PaymentStatus.Completed)
                throw new ConflictException("Payment already completed.");

            var isSuccess = DeterminePaymentSuccess(payment.Method);

            payment.Status = isSuccess ? PaymentStatus.Completed : PaymentStatus.Failed;
            payment.TransactionReference = isSuccess ? GenerateTransactionReference() : null;
            payment.UpdatedAt = DateTime.UtcNow;

            await _paymentRepository.UpdateAsync(payment);

            return MapToDTO(payment);
        }

        private bool DeterminePaymentSuccess(PaymentMethod method)
        {
            if (method == PaymentMethod.COD)
                return true;

            lock (_random)
            {
                return _random.NextDouble() < 0.8;
            }
        }

        public async Task<PaymentResponseDTO> GetPaymentStatusAsync(Guid orderId)
        {
            var payment = await _paymentRepository.GetByOrderId(orderId);
            if (payment == null)
                throw new NotFoundException("Payment", orderId);

            return MapToDTO(payment);
        }

        private static string GenerateTransactionReference()
        {
            return $"TXN-{Guid.NewGuid().ToString("N")[..12].ToUpper()}";
        }

        private static PaymentResponseDTO MapToDTO(Payment payment)
        {
            return new PaymentResponseDTO
            {
                Id = payment.Id,
                OrderId = payment.OrderId,
                Method = payment.Method.ToString(),
                Status = payment.Status.ToString(),
                Amount = payment.Amount,
                TransactionReference = payment.TransactionReference,
                CreatedAt = payment.CreatedAt,
                UpdatedAt = payment.UpdatedAt
            };
        }
    }
}
