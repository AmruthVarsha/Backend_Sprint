using OrderService.Application.DTOs.Order;
using OrderService.Application.Exceptions;
using OrderService.Application.Interfaces;
using OrderService.Domain.Entities;
using OrderService.Domain.Enums;
using OrderService.Domain.Interfaces;

namespace OrderService.Application.Services
{
    public class OrderManagementService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IPaymentService _paymentService;

        private static readonly OrderStatus[] CancellableStatuses =
            { OrderStatus.PaymentPending, OrderStatus.Paid };

        private static readonly Dictionary<OrderStatus, OrderStatus[]> PartnerTransitions = new()
        {
            [OrderStatus.Paid] = new[] { OrderStatus.RestaurantAccepted, OrderStatus.RestaurantRejected },
            [OrderStatus.RestaurantAccepted] = new[] { OrderStatus.Preparing },
            [OrderStatus.Preparing] = new[] { OrderStatus.ReadyForPickup }
        };

        public OrderManagementService(
            IOrderRepository orderRepository,
            ICartRepository cartRepository,
            IPaymentRepository paymentRepository,
            IPaymentService paymentService)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _paymentRepository = paymentRepository;
            _paymentService = paymentService;
        }

        public async Task<OrderResponseDTO> PlaceOrderAsync(PlaceOrderDTO dto, string customerId)
        {
            var cart = await _cartRepository.GetById(dto.CartId);
            if (cart == null)
                throw new NotFoundException("Cart", dto.CartId);

            if (cart.CustomerId != customerId)
                throw new ForbiddenException("You do not have access to this cart.");

            if (cart.Status != CartStatus.Active)
                throw new BadRequestException("Cart is not active and cannot be used to place an order.");

            if (!cart.CartItems.Any())
                throw new BadRequestException("Cart has no items.");

            var totalAmount = cart.CartItems.Sum(ci => ci.UnitPrice * ci.Quantity);

            var order = new Order
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                RestaurantId = cart.RestaurantId,
                Status = OrderStatus.PaymentPending,
                DeliveryAddress = dto.DeliveryAddress,
                DeliveryInstructions = dto.DeliveryInstructions,
                ScheduledSlot = dto.ScheduledSlot,
                TotalAmount = totalAmount,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                OrderItems = cart.CartItems.Select(ci => new OrderItem
                {
                    Id = Guid.NewGuid(),
                    MenuItemId = ci.MenuItemId,
                    MenuItemName = ci.MenuItemName,
                    UnitPrice = ci.UnitPrice,
                    Quantity = ci.Quantity,
                    TotalPrice = ci.UnitPrice * ci.Quantity
                }).ToList()
            };

            await _orderRepository.AddAsync(order);

            var paymentResult = await _paymentService.SimulatePaymentAsync(new DTOs.Payment.SimulatePaymentDTO
            {
                OrderId = order.Id,
                Method = dto.PaymentMethod
            });

            order.Status = paymentResult.Status == PaymentStatus.Success
                ? OrderStatus.Paid
                : OrderStatus.PaymentFailed;
            order.UpdatedAt = DateTime.UtcNow;
            await _orderRepository.UpdateAsync(order);

            cart.Status = CartStatus.Ordered;
            cart.UpdatedAt = DateTime.UtcNow;
            await _cartRepository.UpdateAsync(cart);

            return MapToResponse(order, paymentResult);
        }

        public async Task<IEnumerable<OrderSummaryDTO>> GetOrderHistoryAsync(string customerId)
        {
            var orders = await _orderRepository.GetByCustomerId(customerId);
            return orders.Select(o => new OrderSummaryDTO
            {
                Id = o.Id,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                ItemCount = o.OrderItems.Count,
                CreatedAt = o.CreatedAt
            });
        }

        public async Task<OrderResponseDTO> GetOrderByIdAsync(Guid id, string customerId)
        {
            var order = await _orderRepository.GetByIdWithDetails(id);
            if (order == null)
                throw new NotFoundException("Order", id);

            if (order.CustomerId != customerId)
                throw new ForbiddenException("You do not have access to this order.");

            var payment = await _paymentRepository.GetByOrderId(id);
            DTOs.Payment.PaymentResponseDTO? paymentDto = null;
            if (payment != null)
            {
                paymentDto = new DTOs.Payment.PaymentResponseDTO
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

            return MapToResponse(order, paymentDto);
        }

        public async Task CancelOrderAsync(Guid id, string customerId, CancelOrderDTO dto)
        {
            var order = await _orderRepository.GetById(id);
            if (order == null)
                throw new NotFoundException("Order", id);

            if (order.CustomerId != customerId)
                throw new ForbiddenException("You do not have access to this order.");

            if (!CancellableStatuses.Contains(order.Status))
                throw new BadRequestException($"Order cannot be cancelled in its current status '{order.Status}'.");

            if (DateTime.UtcNow - order.CreatedAt > TimeSpan.FromMinutes(10))
                throw new BadRequestException("The cancellation window of 10 minutes has passed.");

            order.Status = OrderStatus.CancelledByCustomer;
            order.CancellationReason = dto.CancellationReason;
            order.UpdatedAt = DateTime.UtcNow;
            await _orderRepository.UpdateAsync(order);
        }

        public async Task UpdateOrderStatusAsync(Guid id, UpdateOrderStatusDTO dto)
        {
            var order = await _orderRepository.GetById(id);
            if (order == null)
                throw new NotFoundException("Order", id);

            if (!PartnerTransitions.TryGetValue(order.Status, out var allowed) || !allowed.Contains(dto.Status))
                throw new BadRequestException($"Cannot transition order from '{order.Status}' to '{dto.Status}'.");

            order.Status = dto.Status;
            order.UpdatedAt = DateTime.UtcNow;
            await _orderRepository.UpdateAsync(order);
        }

        private static OrderResponseDTO MapToResponse(Order order, DTOs.Payment.PaymentResponseDTO? payment)
        {
            return new OrderResponseDTO
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                RestaurantId = order.RestaurantId,
                Status = order.Status,
                DeliveryAddress = order.DeliveryAddress,
                DeliveryInstructions = order.DeliveryInstructions,
                ScheduledSlot = order.ScheduledSlot,
                TotalAmount = order.TotalAmount,
                CancellationReason = order.CancellationReason,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                Items = order.OrderItems.Select(oi => new OrderItemResponseDTO
                {
                    Id = oi.Id,
                    MenuItemId = oi.MenuItemId,
                    MenuItemName = oi.MenuItemName,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    TotalPrice = oi.TotalPrice
                }).ToList(),
                Payment = payment == null ? null : new OrderPaymentDTO
                {
                    Id = payment.Id,
                    Method = payment.Method.ToString(),
                    Status = payment.Status.ToString(),
                    Amount = payment.Amount,
                    TransactionReference = payment.TransactionReference
                }
            };
        }
    }
}
