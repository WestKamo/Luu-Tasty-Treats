namespace LuuTastyTreats.Api.Shared.Infrastructure.Outbox;
public sealed class OutboxMessage {
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTimeOffset OccurredAtUtc { get; init; } = DateTimeOffset.UtcNow;
    public required string Type { get; init; }
    public required string Payload { get; init; }
    public DateTimeOffset? ProcessedAtUtc { get; set; }
    public int Attempts { get; set; }
    public string? LastError { get; set; }
}
