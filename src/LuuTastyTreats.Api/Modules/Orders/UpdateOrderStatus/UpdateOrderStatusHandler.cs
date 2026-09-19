using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LuuTastyTreats.Api.Modules.Orders.Domain;
using LuuTastyTreats.Api.Modules.Orders.Hubs;
using LuuTastyTreats.Api.Shared.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace LuuTastyTreats.Api.Modules.Orders.Features.UpdateOrderStatus;

public class UpdateOrderStatusHandler : IRequestHandler<UpdateOrderStatusCommand, UpdateOrderStatusResult>
{
    // 1. Added .ToString() so the HashSet holds actual strings
    private static readonly HashSet<string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        OrderStatus.PendingPayment.ToString(), 
        OrderStatus.Paid.ToString(), 
        OrderStatus.InKitchen.ToString(),
        OrderStatus.Ready.ToString(), 
        OrderStatus.OutForDelivery.ToString(), 
        OrderStatus.Completed.ToString(),
        OrderStatus.Cancelled.ToString(), 
        OrderStatus.Refunded.ToString()
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

        // 2. Safely parse the string request into the enum
        order.Status = Enum.Parse<OrderStatus>(request.Status, true);
        
        // 3. Matched DateTime.UtcNow to the DateTime property we added to the Order class
        order.UpdatedAt = DateTime.UtcNow;

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
            status = order.Status.ToString() // Send enum as string over websockets
        }, ct);

        // 4. Return the status as a string to satisfy the Result record
        return new UpdateOrderStatusResult.Success(order.OrderId, order.OrderNumber, order.Status.ToString());
    }
}