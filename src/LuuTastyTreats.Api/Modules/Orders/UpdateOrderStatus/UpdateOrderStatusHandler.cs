using LuuTastyTreats.Api.Modules.Orders.Domain;
using LuuTastyTreats.Api.Modules.Orders.Hubs;
using LuuTastyTreats.Api.Shared.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace LuuTastyTreats.Api.Modules.Orders.Features.UpdateOrderStatus;

public class UpdateOrderStatusHandler : IRequestHandler<UpdateOrderStatusCommand, UpdateOrderStatusResult>
{
    private static readonly HashSet<string> ValidStatuses = new()
    {
        OrderStatus.PendingPayment, OrderStatus.Paid, OrderStatus.InKitchen,
        OrderStatus.Ready, OrderStatus.OutForDelivery, OrderStatus.Completed,
        OrderStatus.Cancelled, OrderStatus.Refunded
    };

    private readonly AppDbContext _db;
    private readonly IHubContext<AdminOrderHub> _hub;

    public UpdateOrderStatusHandler(AppDbContext db, IHubContext<AdminOrderHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    public async Task<UpdateOrderStatusResult> Handle(UpdateOrderStatusCommand request, CancellationToken ct)
    {
        if (!ValidStatuses.Contains(request.Status))
            return new UpdateOrderStatusResult.InvalidStatus();

        var order = await _db.Orders.SingleOrDefaultAsync(o => o.OrderId == request.OrderId, ct);
        if (order is null)
            return new UpdateOrderStatusResult.OrderNotFound();

        order.Status = request.Status;
        order.UpdatedAt = DateTimeOffset.UtcNow;

        _db.Set<OrderStatusHistory>().Add(new OrderStatusHistory
        {
            Id = Guid.NewGuid(),
            OrderId = order.OrderId,
            Status = request.Status,
            Note = request.Note
        });

        await _db.SaveChangesAsync(ct);

        await _hub.Clients.All.SendAsync("OrderStatusUpdated", new
        {
            orderId = order.OrderId,
            orderNumber = order.OrderNumber,
            status = order.Status
        }, ct);

        return new UpdateOrderStatusResult.Success(order.OrderId, order.OrderNumber, order.Status);
    }
}
