using AuthService.Domain.Entities;
using AuthService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuthService.Domain.Interfaces
{
    public interface IAuthRepository
    {
        public Task<User?> FindByEmailAsync(string email);
        public Task<User?> FindByIdAsync(string email);
        public Task<User?> RegisterUserAsync(User user, string password);
        public Task<User?> CheckPasswordAsync(string userId, string password);
        public Task<RepositoryResult> AddToRoleAsync(string userId, string roleName);
        public Task<IList<string>?> GetRolesAsync(string userId);
        public Task<RepositoryResult> RemoveRolesAsync(string userId, IList<string> oldRoles);
        public Task<RepositoryResult> SetTwoFactorAsync(string userId, bool enabled);
        public Task<string?> GenerateTwoFactorToken(string userId);
        public Task<RepositoryResult> ValidateTwoFactorToken(string userId, string token);
        public Task<RepositoryResult> ConfirmEmailAsync(string userId);
        public Task<RepositoryResult> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
        public Task<RepositoryResult> ResetPasswordAsync(string userId, string newPassword);
        public Task<bool> RoleExistsAsync(string roleName);
        public Task SaveOtpAsync(string userId, string otp, PurposeEnum purpose);
        public Task<bool> VerifyOtpAsync(string userId, string token, PurposeEnum purpose);
        public Task<RepositoryResult> ChangeAccountStatusAsync(string userId, bool isActive);
        public Task AddRoleApprovalRequest(RoleApprovalRequest request);
        public Task<IEnumerable<RoleApprovalRequest>> PendingRequests();
        public Task ApproveRequest(string email);
    }
}
