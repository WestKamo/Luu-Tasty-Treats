using MediatR;
namespace LuuTastyTreats.Api.Modules.Payments.Features.PayFastWebhook;
public sealed record PayFastWebhookCommand(Dictionary<string, string> FormData) : IRequest<PayFastWebhookResult>;
public sealed record PayFastWebhookResult(bool Success, bool AlreadyProcessed, string? Error = null);
