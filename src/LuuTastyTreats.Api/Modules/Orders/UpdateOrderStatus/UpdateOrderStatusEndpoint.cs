using MediatR;

namespace LuuTastyTreats.Api.Modules.Orders.Features.UpdateOrderStatus;

public static class UpdateOrderStatusEndpoint
{
    public static void MapUpdateOrderStatusEndpoint(this RouteGroupBuilder group)
    {
        group.MapPut("/admin/orders/{id:guid}/status", async (
            Guid id, UpdateOrderStatusRequest request, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new UpdateOrderStatusCommand(id, request.Status, request.Note), ct);
            return result switch
            {
                UpdateOrderStatusResult.Success s => Results.Ok(new { orderId = s.OrderId, orderNumber = s.OrderNumber, status = s.Status }),
                UpdateOrderStatusResult.OrderNotFound => Results.NotFound(new { error = "Order not found." }),
                UpdateOrderStatusResult.InvalidStatus => Results.BadRequest(new { error = "Invalid status value." }),
                _ => Results.Problem("Unexpected result.")
            };
        })
        .RequireAuthorization("AdminOrAbove")
        .WithName("UpdateOrderStatus")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status400BadRequest);
    }
}

