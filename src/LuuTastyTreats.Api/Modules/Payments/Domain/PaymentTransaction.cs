namespace LuuTastyTreats.Api.Modules.Payments.Domain;
public sealed class PaymentTransaction {
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string Gateway { get; set; } = "payfast";
    public string GatewayReference { get; set; } = string.Empty; // pf_payment_id
    public string Status { get; set; } = string.Empty;            // COMPLETE, FAILED, PENDING
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "ZAR";
    public string RawPayload { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ProcessedAt { get; set; }
    public string? FailureReason { get; set; }
}
