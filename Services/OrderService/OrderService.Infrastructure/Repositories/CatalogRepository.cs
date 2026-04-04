using OrderService.Domain.ExternalDTO;
using OrderService.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Net.Http.Json;
using System.Text;

namespace OrderService.Infrastructure.Repositories
{
    public class CatalogRepository : ICatalogRepository
    {
        private readonly HttpClient _client;

        public CatalogRepository(HttpClient client)
        {
            _client = client;
        }

        public async Task<MenuItemDTO?> GetItemById(Guid id)
        {
            var response = await _client.GetAsync($"api/MenuItem/{id}");
            if (!response.IsSuccessStatusCode) return null;
            return await response.Content.ReadFromJsonAsync<MenuItemDTO>();
        }

        public async Task<RestaurantDTO?> GetRestaurantById(Guid id)
        {
            var response = await _client.GetAsync($"api/Restaurant/restaurant/{id}");
            if (!response.IsSuccessStatusCode) return null;
            return await response.Content.ReadFromJsonAsync<RestaurantDTO>();
        }
    }
}
