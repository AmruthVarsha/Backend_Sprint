namespace OrderService.Domain.Entities
{
    /// <summary>
    /// Delivery-agent-specific profile stored in OrderService.
    /// Keeps the AuthService User model clean — only delivery agents have this.
    /// Agents register/update this profile to become available for auto-assignment.
    /// </summary>
    public class DeliveryAgentProfile
    {
        public Guid Id { get; set; }

        // References the UserId in AuthService (NameIdentifier claim)
        public string AgentUserId { get; set; } = string.Empty;
        public string AgentName { get; set; } = string.Empty;

        // Availability for auto-assignment
        public bool IsActive { get; set; } = false;

        // Used for proximity matching — must match restaurant's service pincode
        public string CurrentPincode { get; set; } = string.Empty;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
