using OrderService.Application.DTOs.Order;
using OrderService.Application.DTOs.Payment;
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
        private readonly IAuthRepository _authRepository;
        private readonly IOrderStatusPublisher _orderStatusPublisher;
        private readonly ICatalogRepository _catalogRepository;

        public OrderManagementService(
            IOrderRepository orderRepository,
            ICartRepository cartRepository,
            IPaymentRepository paymentRepository,
            IAuthRepository authRepository,
            IOrderStatusPublisher orderStatusPublisher,
            ICatalogRepository catalogRepository)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _paymentRepository = paymentRepository;
            _authRepository = authRepository;
            _orderStatusPublisher = orderStatusPublisher;
            _catalogRepository = catalogRepository;
        }

        public async Task<OrderResponseDTO> PlaceOrderAsync(PlaceOrderDTO dto, string customerId, string token)
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

            var address = await _authRepository.GetAddressById(dto.AddressId, token);
            if (address == null)
                throw new NotFoundException("Address", dto.AddressId);

            if (address.UserId != customerId)
                throw new ForbiddenException("The selected address does not belong to you.");

            var totalAmount = cart.CartItems.Sum(ci => ci.UnitPrice * ci.Quantity);

            var order = new Order
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                RestaurantId = cart.RestaurantId,
                Status = OrderStatus.Pending,
                Street = address.Street,
                City = address.City,
                State = address.State,
                Pincode = address.Pincode,
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

            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                Method = dto.PaymentMethod,
                Amount = totalAmount,
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _paymentRepository.AddAsync(payment);

            var restaurant = await _catalogRepository.GetRestaurantById(order.RestaurantId);

            await _orderStatusPublisher.PublishOrderStatus(order.Id, order.CustomerId,restaurant.Name, order.TotalAmount, order.Status.ToString(), order.CreatedAt);

            cart.Status = CartStatus.Ordered;
            cart.UpdatedAt = DateTime.UtcNow;
            await _cartRepository.UpdateAsync(cart);

            return MapToResponse(order, null);
        }

        public async Task<IEnumerable<OrderSummaryDTO>> GetOrderHistoryAsync(string customerId)
        {
            var orders = await _orderRepository.GetByCustomerId(customerId);
            return orders.Select(o => new OrderSummaryDTO
            {
                Id = o.Id,
                Status = o.Status.ToString(),
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
            var paymentDto = payment == null ? null : MapPaymentToDTO(payment);

            return MapToResponse(order, paymentDto);
        }

        public async Task CancelOrderAsync(Guid id, string customerId, CancelOrderDTO dto)
        {
            var order = await _orderRepository.GetById(id);
            if (order == null)
                throw new NotFoundException("Order", id);

            if (order.CustomerId != customerId)
                throw new ForbiddenException("You do not have access to this order.");

            if (!CanCancelOrder(order.Status))
                throw new BadRequestException($"Order cannot be cancelled in status '{order.Status}'.");

            if (DateTime.UtcNow - order.CreatedAt > TimeSpan.FromMinutes(10))
                throw new BadRequestException("Cancellation window of 10 minutes has passed.");

            order.Status = OrderStatus.CancelledByCustomer;
            order.CancellationReason = dto.CancellationReason;
            order.UpdatedAt = DateTime.UtcNow;
            await _orderRepository.UpdateAsync(order);

            var restaurant = await _catalogRepository.GetRestaurantById(order.RestaurantId);

            await _orderStatusPublisher.PublishOrderStatus(order.Id, order.CustomerId, restaurant.Name, order.TotalAmount, order.Status.ToString(), order.CreatedAt);
        }

        public async Task UpdateOrderStatusAsync(Guid id, UpdateOrderStatusDTO dto)
        {
            var order = await _orderRepository.GetById(id);
            if (order == null)
                throw new NotFoundException("Order", id);

            if (!IsValidTransition(order.Status, dto.Status))
                throw new BadRequestException($"Cannot transition from '{order.Status}' to '{dto.Status}'.");

            order.Status = dto.Status;
            order.UpdatedAt = DateTime.UtcNow;
            await _orderRepository.UpdateAsync(order);

            var restaurant = await _catalogRepository.GetRestaurantById(order.RestaurantId);

            await _orderStatusPublisher.PublishOrderStatus(order.Id, order.CustomerId, restaurant.Name, order.TotalAmount, order.Status.ToString(), order.CreatedAt);
        }

        private static bool CanCancelOrder(OrderStatus status)
        {
            return status == OrderStatus.Pending;
        }

        private static bool IsValidTransition(OrderStatus from, OrderStatus to)
        {
            return (from, to) switch
            {
                (OrderStatus.Pending, OrderStatus.RestaurantAccepted) => true,
                (OrderStatus.Pending, OrderStatus.RestaurantRejected) => true,
                (OrderStatus.RestaurantAccepted, OrderStatus.Preparing) => true,
                (OrderStatus.Preparing, OrderStatus.ReadyForPickup) => true,
                (OrderStatus.ReadyForPickup, OrderStatus.OutForDelivery) => true,
                _ => false
            };
        }

        private static OrderResponseDTO MapToResponse(Order order, PaymentResponseDTO? payment)
        {
            return new OrderResponseDTO
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                RestaurantId = order.RestaurantId,
                Status = order.Status.ToString(),
                Street = order.Street,
                City = order.City,
                State = order.State,
                Pincode = order.Pincode,
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
             
            };
        }

        private static PaymentResponseDTO MapPaymentToDTO(Payment payment)
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
