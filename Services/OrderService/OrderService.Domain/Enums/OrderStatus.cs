namespace OrderService.Domain.Enums
{
    public enum OrderStatus
    {
        Pending,
        RestaurantAccepted,
        RestaurantRejected,
        Preparing,
        ReadyForPickup,
        PickedUp,
        OutForDelivery,
        Delivered,
        CancelledByCustomer
    }
}
