using MassTransit;
using Shared.Events;
using AuthService.Domain.Interfaces;

namespace AuthService.Infrastructure.Messaging.Consumers
{
    public class UserUpdateConsumer : IConsumer<UserDataSyncEvent>
    {
        private readonly IUserRepository _userRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;

        public UserUpdateConsumer(IUserRepository userRepository, IRefreshTokenRepository refreshTokenRepository)
        {
            _userRepository = userRepository;
            _refreshTokenRepository = refreshTokenRepository;
        }

        public async Task Consume(ConsumeContext<UserDataSyncEvent> context)
        {
            var message = context.Message;

            if (message.EventType == "Updated")
            {
                var user = await _userRepository.GetByIdAsync(message.UserId);
                if (user != null)
                {
                    bool wasActive = user.IsActive;

                    user.FullName = message.FullName;
                    user.PhoneNo = message.PhoneNo;
                    user.IsActive = message.IsActive;
                    user.EmailConfirmed = message.EmailConfirmed;
                    user.TwoFactorEnabled = message.TwoFactorEnabled;

                    await _userRepository.UpdateAsync(user);

                    // If the user was just deactivated, revoke all their refresh tokens
                    // so they cannot silently continue their session past the next token refresh.
                    if (wasActive && !message.IsActive)
                    {
                        var tokens = await _refreshTokenRepository.GetByUserIdAsync(message.UserId);
                        await _refreshTokenRepository.RevokeAll(tokens, "admin-deactivation");
                    }
                }
            }
            else if (message.EventType == "Deleted")
            {
                await _userRepository.DeleteAsync(message.UserId);

                var tokens = await _refreshTokenRepository.GetByUserIdAsync(message.UserId);
                await _refreshTokenRepository.RevokeAll(tokens, "admin-deleted");
            }
        }
    }
}
