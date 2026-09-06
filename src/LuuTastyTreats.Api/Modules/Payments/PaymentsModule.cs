using LuuTastyTreats.Api.Modules.Payments.Features.CreatePayFastPayment;
using LuuTastyTreats.Api.Modules.Payments.Features.PayFastWebhook;
namespace LuuTastyTreats.Api.Modules.Payments;
public static class PaymentsModule {
    public static void MapPaymentsEndpoints(this WebApplication app) {
        var group = app.MapGroup("/api/v1").WithTags("Payments");
        group.MapCreatePayFastPaymentEndpoint();
        group.MapPayFastWebhookEndpoint();
    }
}
