using System.Globalization;
using LuuTastyTreats.Api.Modules.Orders.Domain;
using LuuTastyTreats.Api.Shared.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
namespace LuuTastyTreats.Api.Modules.Payments.Features.CreatePayFastPayment;
public static class CreatePayFastPaymentEndpoint {
    public static void MapCreatePayFastPaymentEndpoint(this RouteGroupBuilder group) {
        group.MapPost("/payments/payfast", async (PayFastPaymentRequest request, AppDbContext db, IOptions<PayFastOptions> options, CancellationToken ct) => {
            if (string.IsNullOrWhiteSpace(request.OrderNumber))
                return Results.BadRequest(new { error = "Order number is required." });
            var settings = options.Value;
            if (string.IsNullOrWhiteSpace(settings.MerchantId) || string.IsNullOrWhiteSpace(settings.MerchantKey))
                return Results.Problem("PayFast is not configured.", statusCode: StatusCodes.Status500InternalServerError);
            var order = await db.Orders.Include(x => x.Items).SingleOrDefaultAsync(x => x.OrderNumber == request.OrderNumber, ct);
            if (order is null) return Results.NotFound(new { error = "Order not found." });
            
            // Authoritative server-side amount calculation
            var amount = order.Items.Sum(item => item.UnitPrice * item.Quantity) + order.DeliveryFee;
            if (amount <= 0) return Results.BadRequest(new { error = "Order has an invalid payment amount." });
            
            var paymentFields = new Dictionary<string, string> {
                ["merchant_id"] = settings.MerchantId,
                ["merchant_key"] = settings.MerchantKey,
                ["return_url"] = settings.ReturnUrl,
                ["cancel_url"] = settings.CancelUrl,
                ["notify_url"] = settings.NotifyUrl,
                ["m_payment_id"] = order.OrderNumber,
                ["amount"] = amount.ToString("0.00", CultureInfo.InvariantCulture),
                ["item_name"] = $"LuuTastyTreats Order {order.OrderNumber}",
                ["item_description"] = $"Cake order {order.OrderNumber}",
                ["currency"] = "ZAR"
            };
            var signature = PayFastSignature.Generate(paymentFields, settings.PassPhrase);
            paymentFields["signature"] = signature;
            
            return Results.Ok(new PayFastPaymentResponse { ProcessUrl = settings.ProcessUrl, Fields = paymentFields });
        })
        .RequireAuthorization()
        .WithName("CreatePayFastPayment")
        .WithSummary("Creates a signed PayFast checkout payload.")
        .Produces<PayFastPaymentResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound);
    }
}
