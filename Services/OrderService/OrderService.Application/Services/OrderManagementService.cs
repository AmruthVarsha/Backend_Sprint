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
        private readonly IRestaurantOrderRepository _restaurantOrderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IDeliveryAssignmentRepository _deliveryAssignmentRepository;
        private readonly IDeliveryAgentProfileRepository _agentProfileRepository;
        private readonly IAuthRepository _authRepository;
        private readonly IOrderStatusPublisher _orderStatusPublisher;
        private readonly ICatalogRepository _catalogRepository;

        public OrderManagementService(
            IOrderRepository orderRepository,
            IRestaurantOrderRepository restaurantOrderRepository,
            ICartRepository cartRepository,
            IPaymentRepository paymentRepository,
            IDeliveryAssignmentRepository deliveryAssignmentRepository,
            IDeliveryAgentProfileRepository agentProfileRepository,
            IAuthRepository authRepository,
            IOrderStatusPublisher orderStatusPublisher,
            ICatalogRepository catalogRepository)
        {
            _orderRepository = orderRepository;
            _restaurantOrderRepository = restaurantOrderRepository;
            _cartRepository = cartRepository;
            _paymentRepository = paymentRepository;
            _deliveryAssignmentRepository = deliveryAssignmentRepository;
            _agentProfileRepository = agentProfileRepository;
            _authRepository = authRepository;
            _orderStatusPublisher = orderStatusPublisher;
            _catalogRepository = catalogRepository;
        }

        public async Task<OrderResponseDTO> CheckoutAsync(
            CheckoutDTO dto, string customerId, string customerName, string token)
        {
            // 1. Validate address
            var address = await _authRepository.GetAddressById(dto.AddressId, token);
            if (address == null)
                throw new NotFoundException("Address", dto.AddressId);

            if (address.UserId != customerId)
                throw new ForbiddenException("The selected address does not belong to you.");

            // 1.5. Check for delivery agent availability in the area
            var availableAgents = await _agentProfileRepository.GetActiveByPincode(address.Pincode);
            if (!availableAgents.Any())
                throw new BadRequestException("Delivery agents are not available in your area.");

            // 2. Validate items from DTO
            if (dto.Items == null || !dto.Items.Any())
                throw new BadRequestException("No items found in your checkout request.");

            // Group items by restaurant to create sub-orders
            var itemsByRestaurant = dto.Items.GroupBy(i => i.RestaurantId).ToList();

            // 3. Validate each restaurant and items
            var restaurantOrders = new List<RestaurantOrder>();
            decimal grandTotal = 0;

            foreach (var restaurantGroup in itemsByRestaurant)
            {
                var restaurantId = restaurantGroup.Key;
                var restaurant = await _catalogRepository.GetRestaurantById(restaurantId);
                if (restaurant == null)
                    throw new NotFoundException("Restaurant", restaurantId);

                if (!restaurant.IsActive)
                    throw new BadRequestException($"Restaurant '{restaurant.Name}' is currently inactive.");

                if (!restaurant.IsApproved)
                    throw new BadRequestException($"Restaurant '{restaurant.Name}' is not yet approved.");

                var currentTime = TimeOnly.FromDateTime(DateTime.Now);
                var openingTime = TimeOnly.Parse(restaurant.OpeningTime);
                var closingTime = TimeOnly.Parse(restaurant.ClosingTime);

                if (currentTime < openingTime || currentTime > closingTime)
                    throw new BadRequestException(
                        $"Restaurant '{restaurant.Name}' is currently closed ({restaurant.OpeningTime} – {restaurant.ClosingTime}).");

                var isServiceable = await _catalogRepository.IsServiceAreaAvailable(restaurantId, address.Pincode);
                if (!isServiceable)
                    throw new BadRequestException($"Restaurant '{restaurant.Name}' does not deliver to pincode {address.Pincode}.");

                decimal subTotal = 0;
                var orderItems = new List<OrderItem>();

                foreach (var itemDto in restaurantGroup)
                {
                    var category = restaurant.Menu.FirstOrDefault(c => c.Items.Any(i => i.Id == itemDto.MenuItemId));
                    var menuItem = category?.Items.FirstOrDefault(i => i.Id == itemDto.MenuItemId);

                    if (menuItem == null)
                        throw new BadRequestException($"'{itemDto.MenuItemName}' from '{restaurant.Name}' is no longer available.");

                    if (!menuItem.IsAvailable)
                        throw new BadRequestException($"'{itemDto.MenuItemName}' from '{restaurant.Name}' is currently unavailable.");

                    if (!category.IsActive)
                        throw new BadRequestException($"'{itemDto.MenuItemName}' belongs to an inactive category.");

                    var lineTotal = itemDto.UnitPrice * itemDto.Quantity;
                    subTotal += lineTotal;

                    orderItems.Add(new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        MenuItemId = itemDto.MenuItemId,
                        MenuItemName = itemDto.MenuItemName,
                        UnitPrice = itemDto.UnitPrice,
                        Quantity = itemDto.Quantity,
                        TotalPrice = lineTotal
                    });
                }

                grandTotal += subTotal;

                restaurantOrders.Add(new RestaurantOrder
                {
                    Id = Guid.NewGuid(),
                    RestaurantId = restaurantId,
                    RestaurantName = restaurant.Name,
                    RestaurantAddress = restaurant.FormattedAddress,
                    SubTotal = subTotal,
                    Status = RestaurantOrderStatus.Pending,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    OrderItems = orderItems
                });
            }

            // 4. Create parent Order
            var order = new Order
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                CustomerName = customerName,
                Street = address.Street,
                City = address.City,
                State = address.State,
                Pincode = address.Pincode,
                DeliveryInstructions = dto.DeliveryInstructions,
                ScheduledSlot = dto.ScheduledSlot,
                TotalAmount = grandTotal,
                Status = OrderStatus.Placed,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                RestaurantOrders = restaurantOrders
            };

            await _orderRepository.AddAsync(order);

            // 5. Create Payment record
            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                Method = dto.PaymentMethod,
                Amount = grandTotal,
                Status = dto.PaymentMethod == PaymentMethod.Online ? PaymentStatus.Completed : PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _paymentRepository.AddAsync(payment);

            // 6. Auto-assign delivery agent
            await TryAutoAssignAgentAsync(order, address.Pincode);

            // 8. Publish event
            await _orderStatusPublisher.PublishOrderStatus(
                order.Id, order.CustomerId,
                string.Join(", ", restaurantOrders.Select(ro => ro.RestaurantName)),
                order.TotalAmount, order.Status.ToString(), order.CreatedAt,
                payment.Method.ToString(), payment.Status.ToString());

            // 9. Return full order
            var saved = await _orderRepository.GetByIdWithDetails(order.Id);
            
            string? agentName = null;
            if (saved!.DeliveryAssignment != null)
            {
                var profile = await _agentProfileRepository.GetByAgentUserId(saved.DeliveryAssignment.DeliveryAgentId);
                agentName = profile?.AgentName;
            }

            return MapToOrderResponse(saved!, payment, agentName);
        }

        private async Task TryAutoAssignAgentAsync(Order order, string deliveryPincode)
        {
            var availableAgents = await _agentProfileRepository.GetActiveByPincode(deliveryPincode);
            var agent = availableAgents.FirstOrDefault();

            if (agent == null) return;

            var assignment = new DeliveryAssignment
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                DeliveryAgentId = agent.AgentUserId,
                Status = DeliveryStatus.Assigned
            };

            await _deliveryAssignmentRepository.AddAsync(assignment);

            agent.IsActive = false;
            agent.LastUpdated = DateTime.UtcNow;
            await _agentProfileRepository.UpdateAsync(agent);
        }

        public async Task<IEnumerable<OrderResponseDTO>> GetOrderHistoryAsync(string customerId)
        {
            var orders = await _orderRepository.GetByCustomerId(customerId);
            return orders.Select(o => MapToOrderResponse(o, o.Payment, o.DeliveryAssignment != null ? "Assigned" : null));
        }

        public async Task<OrderResponseDTO> GetOrderByIdAsync(Guid id, string customerId)
        {
            var order = await _orderRepository.GetByIdWithDetails(id);
            if (order == null) throw new NotFoundException("Order", id);
            if (order.CustomerId != customerId) throw new ForbiddenException("You do not have access to this order.");

            string? agentName = null;
            if (order.DeliveryAssignment != null)
            {
                var profile = await _agentProfileRepository.GetByAgentUserId(order.DeliveryAssignment.DeliveryAgentId);
                agentName = profile?.AgentName;
            }

            return MapToOrderResponse(order, order.Payment, agentName);
        }

        public async Task CancelOrderAsync(Guid id, string customerId, CancelOrderDTO dto)
        {
            var order = await _orderRepository.GetByIdWithDetails(id);
            if (order == null) throw new NotFoundException("Order", id);
            if (order.CustomerId != customerId) throw new ForbiddenException("You do not have access to this order.");

            bool anyAccepted = order.RestaurantOrders.Any(ro => ro.Status != RestaurantOrderStatus.Pending);
            if (anyAccepted) throw new BadRequestException("Cannot cancel — at least one restaurant has already started processing your order.");

            if (DateTime.UtcNow - order.CreatedAt > TimeSpan.FromMinutes(10))
                throw new BadRequestException("Cancellation window of 10 minutes has passed.");

            order.Status = OrderStatus.CancelledByCustomer;
            order.CancellationReason = dto.CancellationReason;
            order.UpdatedAt = DateTime.UtcNow;

            foreach (var ro in order.RestaurantOrders)
            {
                ro.Status = RestaurantOrderStatus.Cancelled;
                ro.CancellationReason = "Order cancelled by customer.";
                ro.UpdatedAt = DateTime.UtcNow;
            }

            await _orderRepository.UpdateAsync(order);

            if (order.DeliveryAssignment != null)
            {
                var agentProfile = await _agentProfileRepository.GetByAgentUserId(order.DeliveryAssignment.DeliveryAgentId);
                if (agentProfile != null)
                {
                    agentProfile.IsActive = true;
                    agentProfile.LastUpdated = DateTime.UtcNow;
                    await _agentProfileRepository.UpdateAsync(agentProfile);
                }
            }

            var payment = await _paymentRepository.GetByOrderId(order.Id);
            await _orderStatusPublisher.PublishOrderStatus(
                order.Id, order.CustomerId,
                string.Join(", ", order.RestaurantOrders.Select(ro => ro.RestaurantName)),
                order.TotalAmount, order.Status.ToString(), order.CreatedAt,
                payment?.Method.ToString() ?? "Unknown", payment?.Status.ToString() ?? "Unknown");
        }

        private static OrderResponseDTO MapToOrderResponse(Order order, Payment? payment, string? agentName = null)
        {
            return new OrderResponseDTO
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                CustomerName = order.CustomerName,
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
                DeliveryAgentId = order.DeliveryAssignment?.DeliveryAgentId,
                DeliveryAgentName = agentName ?? "Not Assigned",
                Payment = payment == null ? null : new OrderPaymentDTO
                {
                    Id = payment.Id,
                    Method = payment.Method.ToString(),
                    Status = payment.Status.ToString(),
                    Amount = payment.Amount,
                    TransactionReference = payment.TransactionReference
                },
                RestaurantOrders = order.RestaurantOrders.Select(ro => new RestaurantOrderSummaryDTO
                {
                    Id = ro.Id,
                    RestaurantId = ro.RestaurantId,
                    RestaurantName = ro.RestaurantName,
                    Status = ro.Status.ToString(),
                    SubTotal = ro.SubTotal,
                    CancellationReason = ro.CancellationReason,
                    Items = ro.OrderItems.Select(oi => new OrderItemResponseDTO
                    {
                        Id = oi.Id,
                        MenuItemId = oi.MenuItemId,
                        MenuItemName = oi.MenuItemName,
                        UnitPrice = oi.UnitPrice,
                        Quantity = oi.Quantity,
                        TotalPrice = oi.TotalPrice
                    }).ToList()
                }).ToList()
            };
        }
    }
}
