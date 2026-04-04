using AuthService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuthService.Domain.Interfaces
{
    public interface IAddressRepository
    {
        public Task<Address?> GetById(Guid id);
        public Task<IEnumerable<Address>> GetAllByUserId(string id);
        public Task AddAsync(Address address);
        public Task UpdateAsync(Address address);
        public Task DeleteAsync(Guid id);
    }
}
