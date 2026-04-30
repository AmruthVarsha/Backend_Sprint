using System;
using System.Collections.Generic;
using System.Text;
using AuthService.Domain.Entities;

namespace AuthService.Domain.Interfaces
{
    public interface IUserRepository
    {
        public Task<User?> GetByIdAsync(string userId);
        public Task<IList<string>?> GetRolesAsync(string userId);
        public Task<User?> UpdateAsync(User user);
        public Task<IEnumerable<User>> GetAllUsersAsync();
        public Task<IEnumerable<User>> GetUsersByFilterAsync(string? role,bool? isActive);
        public Task DeleteAsync(string userId);
    }
}
