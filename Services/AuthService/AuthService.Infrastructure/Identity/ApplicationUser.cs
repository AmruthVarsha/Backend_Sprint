using AuthService.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace AuthService.Infrastructure.Identity
{
    public class ApplicationUser : IdentityUser
    {
        public String FullName { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;


        public ICollection<OTPToken>? OTPTokens { get; set; }
        public ICollection<RefreshToken>? RefreshTokens { get; set; }
        public ICollection<Address>? Addresses { get; set; }
    }
}
