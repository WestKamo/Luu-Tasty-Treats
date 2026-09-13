using MediatR;

namespace LuuTastyTreats.Api.Modules.Orders.Features.UpdateOrderStatus;

public record UpdateOrderStatusRequest(string Status, string? Note);
public record UpdateOrderStatusCommand(Guid OrderId, string Status, string? Note) : IRequest<UpdateOrderStatusResult>;

public abstract record UpdateOrderStatusResult
{
    public sealed record Success(Guid OrderId, string OrderNumber, string Status) : UpdateOrderStatusResult;
    public sealed record OrderNotFound : UpdateOrderStatusResult;
    public sealed record InvalidStatus : UpdateOrderStatusResult;
}
