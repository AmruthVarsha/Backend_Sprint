using System;

namespace Shared.Events
{
    public class AdminOrderStatusUpdateEvent
    {
        public Guid OrderId { get; set; }
        public string NewStatus { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
    }
}
