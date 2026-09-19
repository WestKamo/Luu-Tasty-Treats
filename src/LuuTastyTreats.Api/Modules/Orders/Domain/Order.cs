namespace LuuTastyTreats.Api.Modules.Orders.Domain;
public enum OrderStatus { PendingPayment, Paid, Baking, OutForDelivery, Completed, Cancelled }
public class Order {
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = default!;
    public string CustomerEmail { get; set; } = default!;
    public string CustomerPhone { get; set; } = default!;
    public string IdempotencyKey { get; set; } = default!;
    public string RequestHash { get; set; } = default!;
    public DateOnly RequestedDate { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<OrderItem> Items { get; set; } = [];
}
public class OrderItem {
    public Guid OrderItemId { get; set; }
    public Guid OrderId { get; set; }
    public Guid CakeId { get; set; }
    public string CakeName { get; set; } = default!;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public string? Note { get; set; }
}
