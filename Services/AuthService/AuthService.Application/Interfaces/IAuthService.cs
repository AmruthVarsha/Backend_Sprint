using AuthService.Application.DTOs;

namespace AuthService.Application.Interfaces
{
    public interface IAuthService
    {
        public Task RegisterAsync(RegistrationDTO model);
        public Task<LoginResponseDTO> LoginAsync(LoginDTO model, string ipAddress);
        public Task<LoginResponseDTO> RefreshAsync(string refreshToken, string ipAddress);
        public Task LogoutAsync(string refreshToken, string ipAddress);
        public Task SendEmailConfirmationOtpAsync(string email);
        public Task ConfirmEmailAsync(string email, string otp);
        public Task SendTwoFactorOtpAsync(string email);
        public Task<LoginResponseDTO> VerifyTwoFactorOtpAsync(ConfirmEmailDTO model, string ipAddress);
        public Task SetTwoFactorAsync(string email, bool enabled);
        public Task ForgotPasswordAsync(string email);
        public Task ResetPasswordAsync(ResetPasswordDTO model);
        public Task ChangePasswordAsync(string email, ChangePasswordDTO model);
        public Task<ProfileDTO> GetProfileAsync(string email);
        public Task PromoteRoleAsync(string adminEmail, PromoteRoleDTO model);
        public Task ChangeAccountStatusAsync(StatusChangeDTO model, string ipAddress);
        public Task<IEnumerable<PendingRequestsDTO>> PendingRequests();
        public Task ApproveRequest(string email);
    }
}
