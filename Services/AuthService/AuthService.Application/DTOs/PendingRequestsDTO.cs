using AuthService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuthService.Application.DTOs
{
    public class PendingRequestsDTO
    {
        public string Email { get; set; }
        public string Role { get; set; }
    }
}
