using MediatR;
namespace LuuTastyTreats.Api.Modules.Orders.Features.PlaceOrder;
public record PlaceOrderItemInput(Guid CakeId, int Quantity, string? CustomText, List<Guid> SelectedOptionIds);
public record PlaceOrderAddressInput(string Line1, string? Line2, string City, string? ProvinceState, string? PostalCode, string Country);
public record PlaceOrderRequest(string CustomerEmail, string CustomerFullName, string? CustomerPhone, string DeliveryMethod, PlaceOrderAddressInput? DeliveryAddress, DateOnly RequestedDate, List<PlaceOrderItemInput> Items);
public record PlaceOrderCommand(PlaceOrderRequest Request) : IRequest<PlaceOrderResult>;
public abstract record PlaceOrderResult {
    public sealed record Success(Guid OrderId, string OrderNumber, decimal TotalAmount, string Status) : PlaceOrderResult;
    public sealed record ValidationFailed(List<string> Errors) : PlaceOrderResult;
}
