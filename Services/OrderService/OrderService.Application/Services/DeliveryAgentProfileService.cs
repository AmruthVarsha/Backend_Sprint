using OrderService.Application.DTOs.Delivery;
using OrderService.Application.Exceptions;
using OrderService.Application.Interfaces;
using OrderService.Domain.Entities;
using OrderService.Domain.Enums;
using OrderService.Domain.Interfaces;

namespace OrderService.Application.Services
{
    public class DeliveryAgentProfileService : IDeliveryAgentProfileService
    {
        private readonly IDeliveryAgentProfileRepository _profileRepository;

        public DeliveryAgentProfileService(IDeliveryAgentProfileRepository profileRepository)
        {
            _profileRepository = profileRepository;
        }

        public async Task<AgentProfileResponseDTO> UpsertProfileAsync(
            string agentUserId, UpsertAgentProfileDTO dto)
        {
            var existing = await _profileRepository.GetByAgentUserId(agentUserId);

            if (existing == null)
            {
                // First-time registration
                var profile = new DeliveryAgentProfile
                {
                    Id = Guid.NewGuid(),
                    AgentUserId = agentUserId,
                    AgentName = dto.AgentName,
                    IsActive = dto.IsActive,
                    CurrentPincode = dto.CurrentPincode,
                    LastUpdated = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
                await _profileRepository.AddAsync(profile);
                return MapToResponse(profile);
            }
            else
            {
                existing.AgentName = dto.AgentName;
                existing.IsActive = dto.IsActive;
                existing.CurrentPincode = dto.CurrentPincode;
                existing.LastUpdated = DateTime.UtcNow;
                await _profileRepository.UpdateAsync(existing);
                return MapToResponse(existing);
            }
        }

        public async Task<AgentProfileResponseDTO> GetProfileAsync(string agentUserId)
        {
            var profile = await _profileRepository.GetByAgentUserId(agentUserId);
            if (profile == null)
            {
                // Return an empty profile response instead of throwing NotFound,
                // so the frontend can handle the "Not Registered" state gracefully.
                return new AgentProfileResponseDTO
                {
                    AgentUserId = agentUserId,
                    IsActive = false
                };
            }

            return MapToResponse(profile);
        }

        private static AgentProfileResponseDTO MapToResponse(DeliveryAgentProfile profile)
        {
            return new AgentProfileResponseDTO
            {
                Id = profile.Id,
                AgentUserId = profile.AgentUserId,
                AgentName = profile.AgentName,
                IsActive = profile.IsActive,
                CurrentPincode = profile.CurrentPincode,
                LastUpdated = profile.LastUpdated
            };
        }
    }
}
