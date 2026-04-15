using System;
using System.Collections.Generic;
using System.Text;

namespace AuthService.Application.DTOs
{
    public class EmailSettingsDTO
    {
        public string SmtpEmail { get; set; } = string.Empty;
        public int SmtpPort { get; set; }
        public string SenderEmail { get; set; } = string.Empty;
        public string SenderEmailPassword { get; set; } = string.Empty;
    }
}
