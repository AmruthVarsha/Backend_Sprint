using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using AuthService.Infrastructure.Identity;
using AuthService.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuthService.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly RoleManager<IdentityRole> roleManager;
        private readonly AuthDbContext context;

        public UserRepository(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, AuthDbContext context)
        {
            this.userManager = userManager;
            this.roleManager = roleManager;
            this.context = context;
        }

        private void MapToEntity(User user, ApplicationUser appUser)
        {
            user.Id = appUser.Id;
            user.FullName = appUser.FullName;
            user.Email = appUser.Email;
            user.EmailConfirmed = appUser.EmailConfirmed;
            user.IsActive = appUser.IsActive;
            user.TwoFactorEnabled = appUser.TwoFactorEnabled;
            user.PhoneNo = appUser.PhoneNumber;
        }

        private void MapToAppUser(User user, ApplicationUser appUser)
        {
            appUser.UserName = user.Email;
            appUser.FullName = user.FullName;
            appUser.Email = user.Email;
            appUser.EmailConfirmed = user.EmailConfirmed;
            appUser.PhoneNumber = user.PhoneNo;
            appUser.IsActive = user.IsActive; // ← persist activation status from domain
        }

        public async Task<User?> GetByIdAsync(string userId)
        {
            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser == null)
            {
                return null;
            }
            User user = new User();
            MapToEntity(user, appUser);
            return user;
        }
        public async Task<IList<string>?> GetRolesAsync(string userId)
        {
            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser == null) return null;
            return await userManager.GetRolesAsync(appUser);
        }
        public async Task<User?> UpdateAsync(User user)
        {
            var appUser = await userManager.FindByIdAsync(user.Id);
            if (appUser == null) return null;

            MapToAppUser(user, appUser);
            await userManager.UpdateAsync(appUser);
            MapToEntity(user, appUser);
            return user;
        }
        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await userManager.Users
            .Select(u => new User
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                EmailConfirmed = u.EmailConfirmed,
                PhoneNo = u.PhoneNumber,
                IsActive = u.IsActive,
            })
            .ToListAsync();
        }
        public async Task<IEnumerable<User>> GetUsersByFilterAsync(string? role,bool? isActive)
        {
            var query = userManager.Users.AsQueryable();

            if (isActive.HasValue)
                query = query.Where(u => u.IsActive == isActive.Value);

            var users = await query.ToListAsync();

            if (!string.IsNullOrEmpty(role))
            {
                var usersInRole = await userManager.GetUsersInRoleAsync(role);
                var roleUserIds = usersInRole.Select(u => u.Id).ToHashSet();
                users = users.Where(u => roleUserIds.Contains(u.Id)).ToList();
            }

            return users.Select(u => new User {
                Id=  u.Id,
                FullName= u.FullName,
                Email= u.Email,
                EmailConfirmed = u.EmailConfirmed,
                PhoneNo = u.PhoneNumber,
                IsActive = u.IsActive
            });
        }
 
        public async Task DeleteAsync(string userId)
        {
            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser != null)
            {
                await userManager.DeleteAsync(appUser);
            }
        }
    }
}
 
