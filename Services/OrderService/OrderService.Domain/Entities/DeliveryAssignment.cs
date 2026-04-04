using OrderService.Domain.Enums;

namespace OrderService.Domain.Entities
{
    public class DeliveryAssignment
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public string DeliveryAgentId { get; set; } = string.Empty;
        public DeliveryStatus Status { get; set; } = DeliveryStatus.Assigned;
        public DateTime? PickedUpAt { get; set; }
        public DateTime? DeliveredAt { get; set; }

        public Order? Order { get; set; }
    }
}
