using LuuTastyTreats.Api.Shared.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LuuTastyTreats.Api.Modules.Orders.Features.GetAdminOrders;

public class GetAdminOrdersHandler : IRequestHandler<GetAdminOrdersQuery, List<AdminOrderSummaryDto>>
{
    private readonly AppDbContext _db;
    public GetAdminOrdersHandler(AppDbContext db) => _db = db;

    public async Task<List<AdminOrderSummaryDto>> Handle(GetAdminOrdersQuery request, CancellationToken ct)
    {
        return await _db.Orders
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .Take(request.Limit)
            .Select(o => new AdminOrderSummaryDto(o.OrderId, o.OrderNumber, o.Status, o.TotalAmount, o.CreatedAt))
            .ToListAsync(ct);
    }
}

