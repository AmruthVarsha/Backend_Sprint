
using MassTransit;
using Shared.Events;
using AuthService.Domain.Interfaces;
using AuthService.Infrastructure.Messaging.Publishers;

namespace AuthService.Infrastructure.Messaging.Consumers
{
    public class UserRoleApprovalResponseConsumer : IConsumer<UserRoleApprovalResponseEvent>
    {
        private readonly IAuthRepository _authRepository;
        private readonly UserDataSyncPublisher _userDataSyncPublisher;

        public UserRoleApprovalResponseConsumer(IAuthRepository authRepository, UserDataSyncPublisher userDataSyncPublisher)
        {
            _authRepository = authRepository;
            _userDataSyncPublisher = userDataSyncPublisher;
        }

        public async Task Consume(ConsumeContext<UserRoleApprovalResponseEvent> context)
        {
            var message = context.Message;

            if (message.IsApproved)
            {
                // Find user by email
                var user = await _authRepository.FindByEmailAsync(message.Email);
                if (user == null)
                {
                    return;
                }

                // Activate the account (IsActive = true)
                await _authRepository.ChangeAccountStatusAsync(user.Id, true);

                // Mark the approval request as approved in AuthService
                await _authRepository.ApproveRequest(message.Email);

                // Get user roles
                var roles = await _authRepository.GetRolesAsync(user.Id);
                var role = roles.FirstOrDefault() ?? "Unknown";

                // Publish UserDataSyncEvent to sync the user to AdminService
                await _userDataSyncPublisher.PublishUserDataSync(
                    user.Id, 
                    user.FullName, 
                    user.Email, 
                    user.PhoneNo, 
                    role, 
                    user.IsActive, 
                    user.EmailConfirmed, 
                    user.TwoFactorEnabled, 
                    "Created");
            }
        }
    }
}
