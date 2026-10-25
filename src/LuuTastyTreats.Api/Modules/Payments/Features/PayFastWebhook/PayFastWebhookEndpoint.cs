using MediatR;
namespace LuuTastyTreats.Api.Modules.Payments.Features.PayFastWebhook;
public static class PayFastWebhookEndpoint {
    public static void MapPayFastWebhookEndpoint(this RouteGroupBuilder group) {
        group.MapPost("/payments/payfast/notify", async (HttpRequest request, IMediator mediator, CancellationToken ct) => {
            if (!request.HasFormContentType)
                return Results.BadRequest(new { error = "PayFast ITN must use application/x-www-form-urlencoded." });
            var form = await request.ReadFormAsync(ct);
            var data = form.ToDictionary(x => x.Key, x => x.Value.ToString());
            var result = await mediator.Send(new PayFastWebhookCommand(data), ct);
            if (!result.Success) return Results.BadRequest(new { error = result.Error ?? "ITN validation failed." });
            return Results.Ok(new { status = result.AlreadyProcessed ? "already_processed" : "received" });
        })
        .AllowAnonymous()
        .DisableAntiforgery()
        .WithName("PayFastWebhook")
        .WithSummary("Receives and validates PayFast ITN notifications.")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);
    }
}
