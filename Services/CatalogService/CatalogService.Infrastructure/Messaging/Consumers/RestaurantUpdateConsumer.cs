using MassTransit;
using Shared.Events;
using CatalogService.Domain.Interfaces;

namespace CatalogService.Infrastructure.Messaging.Consumers
{
    public class RestaurantUpdateConsumer : IConsumer<RestaurantDataSyncEvent>
    {
        private readonly IRestaurantRepository _restaurantRepository;

        public RestaurantUpdateConsumer(IRestaurantRepository restaurantRepository)
        {
            _restaurantRepository = restaurantRepository;
        }

        public async Task Consume(ConsumeContext<RestaurantDataSyncEvent> context)
        {
            var message = context.Message;

            if (message.EventType == "Updated")
            {
                var restaurant = await _restaurantRepository.GetByIdAsync(message.RestaurantId);
                if (restaurant != null)
                {
                    restaurant.IsActive = message.IsActive;
                    restaurant.IsApproved = message.IsApproved;
                    restaurant.Rating = message.Rating;
                    restaurant.TotalRatings = message.TotalRatings;

                    await _restaurantRepository.UpdateAsync(restaurant);
                }
            }
            else if (message.EventType == "Deleted")
            {
                await _restaurantRepository.DeleteAsync(message.RestaurantId);
            }
        }
    }
}
