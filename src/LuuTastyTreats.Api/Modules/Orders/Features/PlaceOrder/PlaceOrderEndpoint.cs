using FluentValidation;
using MediatR;
namespace LuuTastyTreats.Api.Modules.Orders.Features.PlaceOrder;
public static class PlaceOrderEndpoint {
    public static void MapPlaceOrderEndpoint(this RouteGroupBuilder group) {
        group.MapPost("/orders", async (PlaceOrderRequest request, IValidator<PlaceOrderRequest> validator, IMediator mediator, CancellationToken ct) => {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var result = await mediator.Send(new PlaceOrderCommand(request), ct);
            return result switch {
                PlaceOrderResult.Success s => Results.Created($"/api/v1/orders/{s.OrderId}", new { orderId = s.OrderId, orderNumber = s.OrderNumber, totalAmount = s.TotalAmount, status = s.Status }),
                PlaceOrderResult.ValidationFailed f => Results.BadRequest(new { errors = f.Errors }),
                _ => Results.Problem("Unexpected result.")
            };
        }).AllowAnonymous().WithName("PlaceOrder").Produces(StatusCodes.Status201Created).Produces(StatusCodes.Status400BadRequest).ProducesValidationProblem();
    }
}
