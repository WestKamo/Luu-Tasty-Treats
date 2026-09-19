namespace LuuTastyTreats.Api.Modules.Orders.Domain;
public enum OrderStatus { PendingPayment, Paid, Baking, OutForDelivery, Completed, Cancelled, InKitchen, Ready, Refunded }
public enum DeliveryMethod { Pickup, Delivery }
public class Order {
public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
    public Guid? DeliveryAddressId { get; set; }
    public DeliveryMethod DeliveryMethod { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal TaxAmount { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();
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
   public string CakeNameSnapshot { get; set; } = string.Empty;
    public decimal LineTotal { get; set; }
    public string SelectedCustomizationsJson { get; set; } = string.Empty;
    public ICollection<OrderItemCustomizationSelection> Selections { get; set; } = new List<OrderItemCustomizationSelection>();
    public string CustomText { get; set; } = string.Empty;
}
