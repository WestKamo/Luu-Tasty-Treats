using MediatR;

namespace LuuTastyTreats.Api.Modules.Orders.Features.GetAdminOrders;

public record GetAdminOrdersQuery(int Limit) : IRequest<List<AdminOrderSummaryDto>>;

public record AdminOrderSummaryDto(Guid OrderId, string OrderNumber, string Status, decimal TotalAmount, DateTimeOffset CreatedAt);
