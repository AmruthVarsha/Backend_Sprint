using AuthService.Application.DTOs;
using AuthService.Application.Exceptions;
using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace AuthService.Application.Services
{
    public class AddressService : IAddressService
    {
        private readonly IAddressRepository _addressRepository;
        private readonly IUserRepository _userRepository;

        public AddressService(IAddressRepository addressRepository, IUserRepository userRepository)
        {
            _addressRepository = addressRepository;
            _userRepository = userRepository;
        }

        public async Task<AddressResponseDTO?> GetById(Guid id)
        {
            var address =await  _addressRepository.GetById(id);
            if(address == null) { throw new NotFoundException($"Address with {id} not  found"); }
            return Map(address);
        }

        public async Task<IEnumerable<AddressResponseDTO>> GetAllByUserId(string id)
        {
            var addresses = await _addressRepository.GetAllByUserId(id);
            return addresses.Select(a => Map(a));

        }
        public async Task<AddressResponseDTO> AddAddress(AddressDTO addressDTO, string userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new NotFoundException($"User with {userId} Not found");
            if (!user.IsActive) throw new ForbiddenException("Access Denied cannot perform action");

            Address address = new Address
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Street = addressDTO.Street,
                City = addressDTO.City,
                State = addressDTO.State,
                Pincode = addressDTO.Pincode,
            };
            await _addressRepository.AddAsync(address);
            return Map(address);
        }
        public async Task<AddressResponseDTO> UpdateAddress(UpdateAddressDTO addressDTO, string userId)
        {
            var address = await _addressRepository.GetById(addressDTO.Id);
            if (address == null) throw new NotFoundException($"Address with {addressDTO.Id} not Found");
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new NotFoundException($"User with {userId} Not found");
            if (!user.IsActive) throw new ForbiddenException("Access Denied cannot perform action");
            if (address.UserId != userId) throw new ForbiddenException("access denied Cannot perform this action");

            address.Street = addressDTO.Street;
            address.City = addressDTO.City;
            address.State = addressDTO.State;
            address.Pincode = addressDTO.Pincode;

            await _addressRepository.UpdateAsync(address);

            return Map(address);


        }
        public async Task<bool> DeleteAddress(Guid id, string userId)
        {
            var address = await _addressRepository.GetById(id);
            if (address == null) throw new NotFoundException($"Address with {id} not Found");
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new NotFoundException($"User with {userId} Not found");
            if (!user.IsActive) throw new ForbiddenException("Access Denied cannot perform action");
            if (address.UserId != userId) throw new ForbiddenException("access denied Cannot perform this action");

            await _addressRepository.DeleteAsync(id);
            return true;
        }

        private AddressResponseDTO Map(Address address)
        {
            return new AddressResponseDTO {
                Id = address.Id,
                UserId = address.UserId,
                Street = address.Street,
                City = address.City,
                State = address.State,
                Pincode = address.Pincode
            };
        }
    }
}
