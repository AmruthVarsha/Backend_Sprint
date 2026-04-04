using System;
using System.Collections.Generic;
using System.Text;
using AuthService.Application.DTOs;

namespace AuthService.Application.Interfaces
{
    public interface IAddressService
    {
        public Task<AddressResponseDTO?> GetById(Guid id);

        public Task<IEnumerable<AddressResponseDTO>> GetAllByUserId(string id);
        public Task<AddressResponseDTO> AddAddress(AddressDTO addressDTO,string userId);
        public Task<AddressResponseDTO> UpdateAddress(UpdateAddressDTO addressDTO,string userId);
        public Task<bool> DeleteAddress(Guid id,string userId);
    }
}
