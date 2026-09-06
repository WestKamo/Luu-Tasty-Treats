namespace LuuTastyTreats.Api.Modules.Orders.Domain;
public static class OrderStatus {
    public const string PendingPayment = "pending_payment";
    public const string Paid = "paid";
    public const string InKitchen = "in_kitchen";
    public const string Ready = "ready";
    public const string OutForDelivery = "out_for_delivery";
    public const string Completed = "completed";
    public const string Cancelled = "cancelled";
    public const string Refunded = "refunded";
}
public static class DeliveryMethod {
    public const string Pickup = "pickup";
    public const string Delivery = "delivery";
}
public class Order {
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = default!;
    public Guid UserId { get; set; }
    public string Status { get; set; } = OrderStatus.PendingPayment;
    public string DeliveryMethod { get; set; } = default!;
    public Guid? DeliveryAddressId { get; set; }
    public DateOnly RequestedDate { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string? IdempotencyKey { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();
}
