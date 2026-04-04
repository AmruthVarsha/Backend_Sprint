using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using AuthService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text;

namespace AuthService.Infrastructure.Repositories
{
    public class AddressRepository : IAddressRepository
    {
        private readonly AuthDbContext _context;
        public AddressRepository(AuthDbContext context)
        {
            _context = context;
        }
        public async Task<Address?> GetById(Guid id)
        {
            return await _context.Addresses.FindAsync(id);
        }
        public async Task<IEnumerable<Address>> GetAllByUserId(string id)
        {
            return await _context.Addresses.Where(x => x.UserId == id).ToListAsync();
        }
        public async Task AddAsync(Address address)
        {
            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateAsync(Address address)
        {
            _context.Addresses.Update(address);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteAsync(Guid id)
        {
            var address = await _context.Addresses.FindAsync(id);
            if(address == null)
            {
                return;
            }
            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();
        }
    }
}
