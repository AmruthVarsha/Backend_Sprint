using System;
using System.Collections.Generic;
using System.Text;

namespace AuthService.Application.DTOs
{
    public class ProfileDTO
    {
        public string UserId { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public string PhoneNo { get; set; } = string.Empty;
        public bool IsEmailConfirmed { get; set; }
        public string Role { get; set; } = string.Empty;

    }
}
