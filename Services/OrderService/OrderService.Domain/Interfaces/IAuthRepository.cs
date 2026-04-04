using OrderService.Domain.ExternalDTO;
using System;
using System.Collections.Generic;
using System.Text;

namespace OrderService.Domain.Interfaces
{
    public interface IAuthRepository
    {
        Task<AddressDTO?> GetAddressById(Guid id,string token);
    }
}
