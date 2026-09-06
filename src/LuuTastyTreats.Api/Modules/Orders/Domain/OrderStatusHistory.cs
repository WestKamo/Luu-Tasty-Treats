namespace LuuTastyTreats.Api.Modules.Orders.Domain;
public class OrderStatusHistory {
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string Status { get; set; } = default!;
    public Guid? ChangedBy { get; set; }
    public string? Note { get; set; }
    public DateTimeOffset ChangedAt { get; set; } = DateTimeOffset.UtcNow;
    public Order Order { get; set; } = default!;
}
