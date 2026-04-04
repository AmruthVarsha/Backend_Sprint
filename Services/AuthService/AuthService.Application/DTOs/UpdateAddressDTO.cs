using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace AuthService.Application.DTOs
{
    public class UpdateAddressDTO
    {
        [Required]
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Street { get; set; }

        [Required]
        [StringLength(50)]
        public string City { get; set; }

        [Required]
        [StringLength(50)]
        public string State { get; set; }

        [Required]
        [RegularExpression(@"^/d{6}$")]
        public string Pincode { get; set; }
    }
}
