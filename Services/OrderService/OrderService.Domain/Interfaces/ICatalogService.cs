using OrderService.Domain.ExternalDTO;
using System;
using System.Collections.Generic;
using System.Text;

namespace OrderService.Domain.Interfaces
{
    public interface ICatalogRepository
    {
        Task<MenuItemDTO?> GetItemById(Guid id);
        Task<RestaurantDTO?> GetRestaurantById(Guid id);
    }
}
