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

            if (existing != null && order.Status != OrderStatus.PaymentFailed)
                throw new ConflictException("A successful payment already exists for this order.");

            bool isSuccess = dto.Method == PaymentMethod.COD || new Random().NextDouble() < 0.8;

            if (existing != null)
            {
                existing.Method = dto.Method;
                existing.Status = isSuccess ? PaymentStatus.Success : PaymentStatus.Failed;
                existing.TransactionReference = isSuccess
                    ? $"TXN-{Guid.NewGuid().ToString("N")[..12].ToUpper()}"
                    : null;
                existing.UpdatedAt = DateTime.UtcNow;

                await _paymentRepository.UpdateAsync(existing);

                order.Status = isSuccess ? OrderStatus.Paid : OrderStatus.PaymentFailed;
                order.UpdatedAt = DateTime.UtcNow;
                await _orderRepository.UpdateAsync(order);

                return ToDTO(existing);
            }

            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                OrderId = dto.OrderId,
                Method = dto.Method,
                Amount = order.TotalAmount,
                Status = isSuccess ? PaymentStatus.Success : PaymentStatus.Failed,
                TransactionReference = isSuccess
                    ? $"TXN-{Guid.NewGuid().ToString("N")[..12].ToUpper()}"
                    : null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _paymentRepository.AddAsync(payment);

            order.Status = isSuccess ? OrderStatus.Paid : OrderStatus.PaymentFailed;
            order.UpdatedAt = DateTime.UtcNow;
            await _orderRepository.UpdateAsync(order);

            return ToDTO(payment);
        }

        private static PaymentResponseDTO ToDTO(Payment payment) => new()
        {
            Id = payment.Id,
            OrderId = payment.OrderId,
            Method = payment.Method,
            Status = payment.Status,
            Amount = payment.Amount,
            TransactionReference = payment.TransactionReference,
            CreatedAt = payment.CreatedAt,
            UpdatedAt = payment.UpdatedAt
        };
    }
}
