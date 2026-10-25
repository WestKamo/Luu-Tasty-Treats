using MediatR;

namespace LuuTastyTreats.Api.Modules.Orders.Features.GetAdminOrders;

public static class GetAdminOrdersEndpoint
{
    public static void MapGetAdminOrdersEndpoint(this RouteGroupBuilder group)
    {
        group.MapGet("/admin/orders", async (int? limit, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new GetAdminOrdersQuery(limit ?? 50), ct);
            return Results.Ok(result);
        })
        .RequireAuthorization("AdminOrAbove")
        .WithName("GetAdminOrders")
        .Produces<List<AdminOrderSummaryDto>>(StatusCodes.Status200OK);
    }
}
