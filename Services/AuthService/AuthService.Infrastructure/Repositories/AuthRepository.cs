using AuthService.Domain.Entities;
using AuthService.Domain.Enums;
using AuthService.Domain.Interfaces;
using AuthService.Infrastructure.Identity;
using AuthService.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Collections;

namespace AuthService.Infrastructure.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly RoleManager<IdentityRole> roleManager;
        private readonly AuthDbContext context;

        public AuthRepository(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager,AuthDbContext context)
        {
            this.userManager = userManager;
            this.roleManager = roleManager;
            this.context = context;
        }

        private void MapToEntity(User user,ApplicationUser appUser)
        {
            user.Id = appUser.Id;
            user.FullName = appUser.FullName;
            user.Email = appUser.Email;
            user.EmailConfirmed = appUser.EmailConfirmed;
            user.IsActive = appUser.IsActive;
            user.TwoFactorEnabled = appUser.TwoFactorEnabled;
            user.PhoneNo = appUser.PhoneNumber;
        }
        private void MapToAppUser(User user,ApplicationUser appUser)
        {
            appUser.UserName = user.Email;
            appUser.FullName = user.FullName;
            appUser.Email = user.Email;
            appUser.EmailConfirmed = user.EmailConfirmed;
            appUser.IsActive = user.IsActive;
            appUser.PhoneNumber = user.PhoneNo;
        }

        public async Task<User?> FindByEmailAsync(string email)
        {
            ApplicationUser appUser =  await userManager.FindByEmailAsync(email);
            if (appUser == null) return null;
            User user = new User();
            MapToEntity(user, appUser);
            return user;
        }
        public async Task<User?> FindByIdAsync(string id)
        {
            ApplicationUser appUser =  await userManager.FindByIdAsync(id);
            if (appUser == null) return null;
            User user = new User();
            MapToEntity(user, appUser);
            return user;
        }
        public async Task<User?> RegisterUserAsync(User user,string password)
        {
            ApplicationUser appUser = new ApplicationUser();
            MapToAppUser(user, appUser);
            var result = await userManager.CreateAsync(appUser, password);
            if (result.Succeeded)
            {
                MapToEntity(user, appUser);
                return user;
            }
            return null;
        }

        public async Task<User?> CheckPasswordAsync(string userId, string password)
        {
            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser == null) return null;

            var result = await userManager.CheckPasswordAsync(appUser, password);
            if (result)
            {
                User user = new User();
                MapToEntity(user, appUser);
                return user;
            }
            return null;
        }

        public async Task<RepositoryResult> AddToRoleAsync(string userId, string roleName)
        {
            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser == null) return RepositoryResult.Fail("Not Found");
            var result = await userManager.AddToRoleAsync(appUser, roleName);
            if (result.Succeeded)
            {
                return RepositoryResult.Ok();
            }
            return RepositoryResult.Fail(result.Errors.First().Description);
        }

        public async Task<IList<string>?> GetRolesAsync(string userId)
        {
            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser == null)
            {
                return null;
            }
            return await userManager.GetRolesAsync(appUser);
        }

        public async Task<RepositoryResult> RemoveRolesAsync(string userId,IList<string> oldRoles)
        {
            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser == null) return RepositoryResult.Fail("Not Found");

            var result = await userManager.RemoveFromRolesAsync(appUser, oldRoles);
            if (result.Succeeded)
            {
                return RepositoryResult.Ok();
            }
            return RepositoryResult.Fail(result.Errors.First().Description);
        }

        public async Task<RepositoryResult> SetTwoFactorAsync(string userId, bool enabled)
        {
            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser == null) return RepositoryResult.Fail("Not Found");

            var result = await userManager.SetTwoFactorEnabledAsync(appUser, enabled);
            if (result.Succeeded)
            {
                return RepositoryResult.Ok();
            }
            return RepositoryResult.Fail(result.Errors.First().Description);
        }

        public async Task<string?> GenerateTwoFactorToken(string userId)
        {
            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser == null) return null;

            return await userManager.GenerateTwoFactorTokenAsync(appUser,"Email");
        }

        public async Task<RepositoryResult> ValidateTwoFactorToken(string userId,string token)
        {
            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser == null) return RepositoryResult.Fail("Not Found");

            var result = await userManager.VerifyTwoFactorTokenAsync(appUser, "Email", token);
            if (result)
            {
                return RepositoryResult.Ok();
            }
            return RepositoryResult.Fail("Invalid OTP");
        }

        public async Task<RepositoryResult> ConfirmEmailAsync(string userId)
        {
            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser == null) return RepositoryResult.Fail("Not Found");
            appUser.EmailConfirmed = true;
            var result = await userManager.UpdateAsync(appUser);
            if (result.Succeeded)
            {
                return RepositoryResult.Ok();
            }
            return RepositoryResult.Fail(result.Errors.First().Description);
        }

        public async Task<RepositoryResult> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
        {
            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser == null) return RepositoryResult.Fail("Not Found");
            var result = await userManager.ChangePasswordAsync(appUser,currentPassword,newPassword);
            if (result.Succeeded)
            {
                return RepositoryResult.Ok();
            }
            return RepositoryResult.Fail(result.Errors.First().Description);
        }

        public async Task<RepositoryResult> ResetPasswordAsync(string userId, string newPassword)
        {
            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser == null) return RepositoryResult.Fail("Not Found");
            var token = await userManager.GeneratePasswordResetTokenAsync(appUser);
            var result = await userManager.ResetPasswordAsync(appUser, token, newPassword);
            if (result.Succeeded)
            {
                return RepositoryResult.Ok();
            }
            return RepositoryResult.Fail(result.Errors.First().Description);
        }

        public async Task<bool> RoleExistsAsync(string roleName)
        {
            return await roleManager.RoleExistsAsync(roleName);
        }

        public async Task SaveOtpAsync(string userId, string otp, PurposeEnum purpose)
        {

            var oldTokens = context.OTPTokens.Where(o => o.UserId == userId && o.Purpose == purpose);
            context.OTPTokens.RemoveRange(oldTokens);

            OTPToken token = new OTPToken()
            {
                Token = otp,
                TokenExpiry = DateTime.UtcNow.AddMinutes(2),
                UserId = userId,
                Purpose = purpose
            };

            context.OTPTokens.Add(token);
            await context.SaveChangesAsync();
        }

        public async Task<bool> VerifyOtpAsync(string userId,string token,PurposeEnum purpose)
        {
            var storedToken = await context.OTPTokens.FirstOrDefaultAsync(o => o.Token==token &&  o.Purpose==purpose && o.UserId==userId);
            if(storedToken == null || storedToken.IsUsed || storedToken.TokenExpiry<DateTime.UtcNow)
            {
                return false;
            }
            storedToken.IsUsed = true;
            context.OTPTokens.Update(storedToken);
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<RepositoryResult> ChangeAccountStatusAsync(string userId, bool isActive)
        {
            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser == null) return RepositoryResult.Fail("Not Found");

            appUser.IsActive = isActive;
            var result = await userManager.UpdateAsync(appUser);

            if (result.Succeeded)
            {
                return RepositoryResult.Ok();
            }
            return RepositoryResult.Fail(result.Errors.First().Description);
        }

        public async Task AddRoleApprovalRequest(RoleApprovalRequest request)
        {
            context.RoleApprovalRequests.Add(request);
            await context.SaveChangesAsync();
        }

        public async Task ApproveRequest(string email)
        {
            var request = await context.RoleApprovalRequests.FirstOrDefaultAsync(r => r.Email == email);
            request.IsApproved = true;
            context.RoleApprovalRequests.Update(request);
            await context.SaveChangesAsync();
        }
        public async Task<IEnumerable<RoleApprovalRequest>> PendingRequests()
        {
            var approved = await context.RoleApprovalRequests.Where(r => r.IsApproved).ToListAsync();
            context.RemoveRange(approved);
            await context.SaveChangesAsync();

            return await context.RoleApprovalRequests.ToListAsync();
        }
    }
}
