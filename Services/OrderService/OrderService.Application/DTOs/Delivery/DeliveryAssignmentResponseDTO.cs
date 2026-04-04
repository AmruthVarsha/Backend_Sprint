using OrderService.Domain.Enums;

namespace OrderService.Application.DTOs.Delivery
{
    public class DeliveryAssignmentResponseDTO
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public string DeliveryAgentId { get; set; } = string.Empty;
        public DeliveryStatus Status { get; set; }
        public string DeliveryAddress { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public DateTime? PickedUpAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
    }
}
