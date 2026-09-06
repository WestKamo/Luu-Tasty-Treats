using LuuTastyTreats.Api.Modules.Orders.Features.PlaceOrder;
namespace LuuTastyTreats.Api.Modules.Orders;
public static class OrdersModule {
    public static void MapOrdersEndpoints(this WebApplication app) {
        var group = app.MapGroup("/api/v1").WithTags("Orders");
        group.MapPlaceOrderEndpoint();
    }
}
