using OrderService.Domain.ExternalDTO;
using OrderService.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Text;

namespace OrderService.Infrastructure.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly HttpClient _client;

        public AuthRepository(HttpClient client)
        {
            _client = client;
        }

        public async Task<AddressDTO?> GetAddressById(Guid id,string token)
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.Replace("Bearer ", "").Trim());
            var response = await _client.GetAsync($"api/User/Address/{id}");
            if (!response.IsSuccessStatusCode) return null;
            return await response.Content.ReadFromJsonAsync<AddressDTO>();
        }

    }
}
