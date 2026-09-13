using LuuTastyTreats.Api.Modules.Orders.Features.GetAdminOrders;
using LuuTastyTreats.Api.Modules.Orders.Features.PlaceOrder;
using LuuTastyTreats.Api.Modules.Orders.Features.UpdateOrderStatus;

namespace LuuTastyTreats.Api.Modules.Orders;

public static class OrdersModule
{
    public static void MapOrdersEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/v1").WithTags("Orders");
        group.MapPlaceOrderEndpoint();
        group.MapUpdateOrderStatusEndpoint();
        group.MapGetAdminOrdersEndpoint();
    }
}
