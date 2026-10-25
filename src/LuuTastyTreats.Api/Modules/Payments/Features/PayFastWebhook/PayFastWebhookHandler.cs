using System.Globalization;
using System.Text.Json;
using LuuTastyTreats.Api.Modules.Orders.Domain;
using LuuTastyTreats.Api.Modules.Orders.Hubs;
using LuuTastyTreats.Api.Modules.Payments.Domain;
using LuuTastyTreats.Api.Shared.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
namespace LuuTastyTreats.Api.Modules.Payments.Features.PayFastWebhook;
public sealed class PayFastWebhookHandler : IRequestHandler<PayFastWebhookCommand, PayFastWebhookResult> {
    private const string Gateway = "payfast";
    private readonly AppDbContext _db;
    private readonly PayFastOptions _options;
    private readonly PayFastClient _payFastClient;
    private readonly IHubContext<AdminOrderHub> _hubContext;
    private readonly ILogger<PayFastWebhookHandler> _logger;
    public PayFastWebhookHandler(AppDbContext db, IOptions<PayFastOptions> options, PayFastClient payFastClient, IHubContext<AdminOrderHub> hubContext, ILogger<PayFastWebhookHandler> logger) {
        _db = db; _options = options.Value; _payFastClient = payFastClient; _hubContext = hubContext; _logger = logger;
    }
    public async Task<PayFastWebhookResult> Handle(PayFastWebhookCommand request, CancellationToken ct) {
        var data = request.FormData;
        if (!data.TryGetValue("m_payment_id", out var orderNumber) || string.IsNullOrWhiteSpace(orderNumber)) return Failure("Missing m_payment_id.");
        if (!data.TryGetValue("pf_payment_id", out var pfPaymentId) || string.IsNullOrWhiteSpace(pfPaymentId)) return Failure("Missing pf_payment_id.");
        if (!data.TryGetValue("payment_status", out var paymentStatus) || string.IsNullOrWhiteSpace(paymentStatus)) return Failure("Missing payment_status.");
        if (!data.TryGetValue("merchant_id", out var merchantId) || merchantId != _options.MerchantId) return Failure("Merchant ID mismatch.");
        
        // Verify MD5 signature
        if (!PayFastSignature.Verify(data, _options.PassPhrase)) {
            _logger.LogWarning("Invalid PayFast signature for order {OrderNumber}", orderNumber);
            return Failure("Invalid signature.");
        }
        
        // Validate directly against PayFast servers
        var serverValidation = await _payFastClient.ValidateNotificationAsync(data, ct);
        if (!serverValidation) {
            _logger.LogWarning("PayFast server validation failed for order {OrderNumber}", orderNumber);
            return Failure("PayFast server validation failed.");
        }
        
        var order = await _db.Orders.Include(x => x.Items).SingleOrDefaultAsync(x => x.OrderNumber == orderNumber, ct);
        if (order is null) return Failure("Order not found.");
        
        if (!decimal.TryParse(data.GetValueOrDefault("amount_gross", "0"), NumberStyles.Number, CultureInfo.InvariantCulture, out var paidAmount))
            return Failure("Invalid amount_gross.");
            
        var expectedAmount = order.Items.Sum(item => item.UnitPrice * item.Quantity) + order.DeliveryFee;
        if (Math.Abs(expectedAmount - paidAmount) > 0.01m) {
            _logger.LogError("PayFast amount mismatch. Order {OrderNumber}. Expected {ExpectedAmount}, received {PaidAmount}", orderNumber, expectedAmount, paidAmount);
            return Failure("Payment amount mismatch.");
        }
        
        // Check idempotency
        var existingTransaction = await _db.PaymentTransactions.SingleOrDefaultAsync(x => x.Gateway == Gateway && x.GatewayReference == pfPaymentId, ct);
        if (existingTransaction is not null) return new PayFastWebhookResult(Success: true, AlreadyProcessed: true);
        
        if (order.Status == OrderStatus.Paid) return new PayFastWebhookResult(Success: true, AlreadyProcessed: true);
        
        var transaction = new PaymentTransaction {
            Id = Guid.NewGuid(), OrderId = order.OrderId, Gateway = Gateway, GatewayReference = pfPaymentId,
            Status = paymentStatus.ToUpperInvariant(), Amount = paidAmount, Currency = "ZAR",
            RawPayload = JsonSerializer.Serialize(data), CreatedAt = DateTimeOffset.UtcNow
        };
        _db.PaymentTransactions.Add(transaction);
        
        var isComplete = paymentStatus.Equals("COMPLETE", StringComparison.OrdinalIgnoreCase);
        if (isComplete) {
            order.Status = OrderStatus.Paid;
            order.UpdatedAt = DateTimeOffset.UtcNow;
            order.StatusHistory.Add(new OrderStatusHistory {
                Id = Guid.NewGuid(), OrderId = order.OrderId, Status = OrderStatus.Paid.ToString(),
                Note = $"Payment received via PayFast (Ref: {pfPaymentId})"
            });
            transaction.ProcessedAt = DateTimeOffset.UtcNow;
        }
        
        await using var dbTransaction = await _db.Database.BeginTransactionAsync(ct);
        try {
            await _db.SaveChangesAsync(ct);
            await dbTransaction.CommitAsync(ct);
        } catch (DbUpdateException) {
            await dbTransaction.RollbackAsync(ct);
            var duplicate = await _db.PaymentTransactions.AnyAsync(x => x.Gateway == Gateway && x.GatewayReference == pfPaymentId, ct);
            if (duplicate) return new PayFastWebhookResult(Success: true, AlreadyProcessed: true);
            return Failure("Payment could not be persisted.");
        }
        
        if (isComplete) {
            await _hubContext.Clients.All.SendAsync("OrderPaidUpdate", new {
                orderId = order.OrderId, orderNumber = order.OrderNumber, status = order.Status, paidAmount = paidAmount
            }, ct);
        }
        
        return new PayFastWebhookResult(Success: true, AlreadyProcessed: false);
    }
    private static PayFastWebhookResult Failure(string reason) => new(Success: false, AlreadyProcessed: false, Error: reason);
}
