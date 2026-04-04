using System;
using System.Collections.Generic;
using System.Text;

namespace OrderService.Domain.ExternalDTO
{
    public class AddressDTO
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public string Street {  get; set; }
        public string City {  get; set; }
        public string State {  get; set; }
        public string Pincode {  get; set; }
    }
}
