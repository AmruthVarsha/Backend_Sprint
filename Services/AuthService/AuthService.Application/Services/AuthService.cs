using AuthService.Application.DTOs;
using AuthService.Application.Exceptions;
using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Domain.Enums;
using AuthService.Domain.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace AuthService.Application.Service
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository authRepository;
        private readonly JwtSettingsDTO jwtSettingsDTO;
        private readonly IEmailService emailService;
        private readonly IRefreshTokenService refreshTokenService;

        public AuthService(IAuthRepository authRepository, JwtSettingsDTO jwtSettingsDTO, IRefreshTokenService refreshTokenService, IEmailService emailService)
        {
            this.authRepository = authRepository;
            this.jwtSettingsDTO = jwtSettingsDTO;
            this.refreshTokenService = refreshTokenService;
            this.emailService = emailService;
        }

        private string GenerateToken(string userId, string fullName, IList<string> roles, string email, bool emailConfirmed)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettingsDTO.Key));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>()
            {
                new Claim(JwtRegisteredClaimNames.Sub,userId),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),

                new Claim(ClaimTypes.Name, fullName),
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Email, email),
                new Claim("EmailConfirmed",emailConfirmed.ToString().ToLower())
            };

            foreach (string role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var token = new JwtSecurityToken(
                issuer: jwtSettingsDTO.Issuer,
                audience: jwtSettingsDTO.Audience,
                claims: claims,
                signingCredentials: credentials,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddMinutes(jwtSettingsDTO.ExpiryMinutes)
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateOTP()
        {
            return RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        }

        public async Task RegisterAsync(RegistrationDTO model)
        {
            var user = await authRepository.FindByEmailAsync(model.Email);
            if (user != null)
            {
                throw new ConflictException("Email already in use");
            }

            User newUser = new User()
            {
                FullName = model.FullName,
                Email = model.Email,
                PhoneNo = model.PhoneNo,
            };

            user = await authRepository.RegisterUserAsync(newUser, model.Password);
            if (user == null) throw new BadRequestException("Unexpected error occurred");

            var result = await authRepository.AddToRoleAsync(user.Id, "Customer");
            if (!result.Succeded)
            {
                throw new BadRequestException(result.Error);
            }
        }

        public async Task<LoginResponseDTO> LoginAsync(LoginDTO model, string ipAddress)
        {
            var user = await authRepository.FindByEmailAsync(model.Email);
            if (user == null)
            {
                throw new UnauthorizedException("Invalid credentials");
            }
            if (!user.IsActive)
            {
                throw new UnauthorizedException("Account has been deactivated");
            }

            var result = await authRepository.CheckPasswordAsync(user.Id, model.Password);
            if (result == null)
            {
                throw new UnauthorizedException("Invalid credentials");
            }

            LoginResponseDTO loginResponseDTO = new LoginResponseDTO();
            if (result.TwoFactorEnabled == true)
            {
                loginResponseDTO.RequireTwoFactor = true;
                loginResponseDTO.Token = null;
                loginResponseDTO.RefreshToken = null;
                return loginResponseDTO;
            }

            IList<string> roles = await authRepository.GetRolesAsync(result.Id);
            loginResponseDTO.Token = GenerateToken(result.Id, result.FullName, roles, result.Email, result.EmailConfirmed);
            loginResponseDTO.RequireTwoFactor = false;

            var newRefreshToken = refreshTokenService.GenerateRefreshToken(ipAddress);
            newRefreshToken.UserId = result.Id;
            await refreshTokenService.AddRefreshToken(newRefreshToken);
            loginResponseDTO.RefreshToken = newRefreshToken;

            return loginResponseDTO;
        }

        public async Task<LoginResponseDTO> RefreshAsync(string refreshToken, string ipAddress)
        {
            if (string.IsNullOrEmpty(refreshToken))
            {
                throw new UnauthorizedException("No refresh token found, please login again");
            }

            RefreshToken storedToken = await refreshTokenService.GetRefreshToken(refreshToken);
            if (storedToken == null || storedToken.ExpiryDate < DateTime.UtcNow)
            {
                throw new UnauthorizedException("Session expired, please login again");
            }
            var user = await authRepository.FindByIdAsync(storedToken.UserId);
            if (user == null)
            {
                throw new UnauthorizedException("User not found, please login again");
            }

            if (storedToken.IsRevoked || !user.IsActive)
            {
                await refreshTokenService.RevokeAllTokens(user.Id, ipAddress);
                throw new UnauthorizedException("Token reuse detected — all tokens have been revoked");
            }

            storedToken.IsRevoked = true;
            storedToken.RevokedIp = ipAddress;
            await refreshTokenService.UpdateRefreshToken(storedToken);

            RefreshToken newRefreshToken = refreshTokenService.GenerateRefreshToken(ipAddress);
            newRefreshToken.UserId = user.Id;
            await refreshTokenService.AddRefreshToken(newRefreshToken);

            var roles = await authRepository.GetRolesAsync(user.Id);
            var token = GenerateToken(user.Id, user.FullName, roles, user.Email, user.EmailConfirmed);

            return new LoginResponseDTO()
            {
                Token = token,
                RefreshToken = newRefreshToken,
                RequireTwoFactor = false
            };
        }

        public async Task LogoutAsync(string refreshToken, string ipAddress)
        {
            if (!string.IsNullOrEmpty(refreshToken))
            {
                var storedToken = await refreshTokenService.GetRefreshToken(refreshToken);
                if (storedToken != null)
                {
                    storedToken.IsRevoked = true;
                    storedToken.RevokedIp = ipAddress;
                    await refreshTokenService.UpdateRefreshToken(storedToken);
                }
            }
        }

        public async Task SendEmailConfirmationOtpAsync(string email)
        {
            var user = await authRepository.FindByEmailAsync(email);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }
            if (!user.IsActive)
            {
                throw new UnauthorizedException("Account has been deactivated");
            }
            if (user.EmailConfirmed)
            {
                throw new BadRequestException("Email is already confirmed");
            }

            string otp = GenerateOTP();
            await authRepository.SaveOtpAsync(user.Id, otp, PurposeEnum.EmailConfirmation);
            await emailService.SendEmailAsync(email, "OTP for Email Confirmation", $"Your email confirmation OTP is: {otp}. It expires in 2 minutes.");
        }

        public async Task ConfirmEmailAsync(string email, string otp)
        {
            var user = await authRepository.FindByEmailAsync(email);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }
            if (!user.IsActive)
            {
                throw new UnauthorizedException("Account has been deactivated");
            }
            if (user.EmailConfirmed)
            {
                throw new BadRequestException("Email is already confirmed");
            }

            var result = await authRepository.VerifyOtpAsync(user.Id, otp, PurposeEnum.EmailConfirmation);
            if (!result)
            {
                throw new BadRequestException("Invalid or expired OTP");
            }

            var isConfirmed = await authRepository.ConfirmEmailAsync(user.Id);
            if (!isConfirmed.Succeded)
            {
                throw new BadRequestException(isConfirmed.Error);
            }
        }

        public async Task SendTwoFactorOtpAsync(string email)
        {
            var user = await authRepository.FindByEmailAsync(email);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }
            if (!user.IsActive)
            {
                throw new UnauthorizedException("Account has been deactivated");
            }
            if (!user.EmailConfirmed)
            {
                throw new ForbiddenException("Email must be confirmed before using two-factor authentication");
            }
            if (!user.TwoFactorEnabled)
            {
                throw new BadRequestException("Two-factor authentication is not enabled for this account");
            }

            var token = await authRepository.GenerateTwoFactorToken(user.Id);
            await emailService.SendEmailAsync(email, "Two-Factor Authentication OTP", $"Your two-factor authentication OTP is: {token}. It expires shortly.");
        }

        public async Task<LoginResponseDTO> VerifyTwoFactorOtpAsync(ConfirmEmailDTO model, string ipAddress)
        {
            var user = await authRepository.FindByEmailAsync(model.Email);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }
            if (!user.IsActive)
            {
                throw new UnauthorizedException("Account has been deactivated");
            }
            if (!user.EmailConfirmed)
            {
                throw new ForbiddenException("Email must be confirmed before using two-factor authentication");
            }

            var result = await authRepository.ValidateTwoFactorToken(user.Id, model.Token);
            if (!result.Succeded)
            {
                throw new BadRequestException("Invalid or expired OTP");
            }

            IList<string> roles = await authRepository.GetRolesAsync(user.Id);
            var jwtToken = GenerateToken(user.Id, user.FullName, roles, user.Email, user.EmailConfirmed);


            var newRefreshToken = refreshTokenService.GenerateRefreshToken(ipAddress);
            newRefreshToken.UserId = user.Id;
            await refreshTokenService.AddRefreshToken(newRefreshToken);

            return new LoginResponseDTO
            {
                Token = jwtToken,
                RefreshToken = newRefreshToken,
                RequireTwoFactor = false
            };
        }

        public async Task SetTwoFactorAsync(string email, bool enabled)
        {
            var user = await authRepository.FindByEmailAsync(email);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }
            if (!user.IsActive)
            {
                throw new UnauthorizedException("Account has been deactivated");
            }
            if (!user.EmailConfirmed && enabled)
            {
                throw new ForbiddenException("Please confirm your email before enabling two-factor authentication");
            }

            var result = await authRepository.SetTwoFactorAsync(user.Id, enabled);
            if (!result.Succeded)
            {
                throw new BadRequestException(result.Error);
            }
        }

        public async Task ForgotPasswordAsync(string email)
        {
            var user = await authRepository.FindByEmailAsync(email);

            if (user == null || !user.IsActive)
            {
                return;
            }

            string otp = GenerateOTP();
            await authRepository.SaveOtpAsync(user.Id, otp, PurposeEnum.ResetPassword);
            await emailService.SendEmailAsync(email, "Password Reset OTP", $"Your password reset OTP is: {otp}. It expires in 2 minutes.");
        }

        public async Task ResetPasswordAsync(ResetPasswordDTO model)
        {
            var user = await authRepository.FindByEmailAsync(model.Email);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }
            if (!user.IsActive)
            {
                throw new UnauthorizedException("Account has been deactivated");
            }

            var isValid = await authRepository.VerifyOtpAsync(user.Id, model.Token, PurposeEnum.ResetPassword);
            if (!isValid)
            {
                throw new BadRequestException("Invalid or expired OTP");
            }

            var result = await authRepository.ResetPasswordAsync(user.Id, model.NewPassword);
            if (!result.Succeded)
            {
                throw new BadRequestException(result.Error);
            }
        }

        public async Task ChangePasswordAsync(string email, ChangePasswordDTO model)
        {
            var user = await authRepository.FindByEmailAsync(email);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }
            if (!user.IsActive)
            {
                throw new UnauthorizedException("Account has been deactivated");
            }

            var result = await authRepository.ChangePasswordAsync(user.Id, model.CurrentPassword, model.NewPassword);
            if (!result.Succeded)
            {
                throw new UnauthorizedException(result.Error);
            }
        }

        public async Task<ProfileDTO> GetProfileAsync(string email)
        {
            var user = await authRepository.FindByEmailAsync(email);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }

            return new ProfileDTO
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNo = user.PhoneNo,
                IsEmailConfirmed = user.EmailConfirmed,
                Role = string.Join(",", await authRepository.GetRolesAsync(user.Id))
            };
        }

        public async Task PromoteRoleAsync(string adminEmail, PromoteRoleDTO model)
        {
            if (adminEmail == model.Email)
            {
                throw new ForbiddenException("You cannot change your own role");
            }

            if (!await authRepository.RoleExistsAsync(model.RoleName))
            {
                throw new BadRequestException($"Role '{model.RoleName}' does not exist");
            }

            var user = await authRepository.FindByEmailAsync(model.Email);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }

            var roles = await authRepository.GetRolesAsync(user.Id);
            var result = await authRepository.RemoveRolesAsync(user.Id, roles);
            if (!result.Succeded)
            {
                throw new BadRequestException(result.Error);
            }

            result = await authRepository.AddToRoleAsync(user.Id, model.RoleName);
            if (!result.Succeded)
            {
                throw new BadRequestException(result.Error);
            }
        }

        public async Task ChangeAccountStatusAsync(StatusChangeDTO model, string ipAddress)
        {
            var user = await authRepository.FindByEmailAsync(model.Email);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }

            var result = await authRepository.ChangeAccountStatusAsync(user.Id, model.IsActive);
            if (!result.Succeded)
            {
                throw new BadRequestException(result.Error);
            }

            if (!model.IsActive)
            {
                await refreshTokenService.RevokeAllTokens(user.Id, ipAddress);
            }
        }
    }
}
