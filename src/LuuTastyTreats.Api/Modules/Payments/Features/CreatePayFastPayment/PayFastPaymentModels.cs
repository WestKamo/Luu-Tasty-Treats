namespace LuuTastyTreats.Api.Modules.Payments.Features.CreatePayFastPayment;
public sealed record PayFastPaymentRequest(string OrderNumber);
public sealed record PayFastPaymentResponse {
    public string ProcessUrl { get; init; } = string.Empty;
    public Dictionary<string, string> Fields { get; init; } = new();
}
