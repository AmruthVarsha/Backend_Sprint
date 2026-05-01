using System.ComponentModel.DataAnnotations;

namespace OrderService.Application.DTOs.Delivery
{
    /// <summary>Agent registers/updates their delivery profile.</summary>
    public class UpsertAgentProfileDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string AgentName { get; set; } = string.Empty;

        [Required]
        [StringLength(20, MinimumLength = 4)]
        public string CurrentPincode { get; set; } = string.Empty;

        [Required]
        public bool IsActive { get; set; }
    }

    /// <summary>Response after profile create/update.</summary>
    public class AgentProfileResponseDTO
    {
        public Guid Id { get; set; }
        public string AgentUserId { get; set; } = string.Empty;
        public string AgentName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string CurrentPincode { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; }
    }
}
