using AuthService.Domain.Entities;
using AuthService.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;

namespace AuthService.Infrastructure.Persistence
{
    public class AuthDbContext : IdentityDbContext<ApplicationUser>
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options) { }

        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<OTPToken> OTPTokens { get; set; }
        public DbSet<Address> Addresses { get; set; }

        public DbSet<RoleApprovalRequest> RoleApprovalRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<RefreshToken>()
                .HasOne<ApplicationUser>()
                .WithMany(a => a.RefreshTokens)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<OTPToken>()
                .HasOne<ApplicationUser>()
                .WithMany(a => a.OTPTokens)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Address>()
                .HasOne<ApplicationUser>()
                .WithMany(a => a.Addresses)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<RoleApprovalRequest>(entity =>
            {
                entity.HasKey(e => e.Email);
                entity.Property(e => e.Email).HasMaxLength(255);
                entity.Property(e => e.Role).HasConversion<string>().HasMaxLength(50);
            });

        }
    }
}
