using System.Text.Json;
using LuuTastyTreats.Api.Modules.Catalog.Domain;
using LuuTastyTreats.Api.Modules.Identity.Domain;
using LuuTastyTreats.Api.Modules.Orders.Domain;
using LuuTastyTreats.Api.Modules.Orders.Hubs;
using LuuTastyTreats.Api.Shared.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

namespace LuuTastyTreats.Api.Modules.Orders.Features.PlaceOrder;

public class PlaceOrderHandler : IRequestHandler<PlaceOrderCommand, PlaceOrderResult> {
    private readonly AppDbContext _db;
    private readonly IHubContext<AdminOrderHub> _hubContext;

    public PlaceOrderHandler(AppDbContext db, IHubContext<AdminOrderHub> hubContext) {
        _db = db;
        _hubContext = hubContext;
    }

    public async Task<PlaceOrderResult> Handle(PlaceOrderCommand command, CancellationToken ct) {
        var request = command.Request;
        var errors = new List<string>();
        
        var customer = await _db.Users.SingleOrDefaultAsync(u => u.Email == request.CustomerEmail, ct);
        if (customer is null) {
            var customerRole = await _db.Roles.SingleAsync(r => r.Name == "Customer", ct);
            customer = new User { 
                UserId = Guid.NewGuid(), 
                Email = request.CustomerEmail, 
                FullName = request.CustomerFullName, 
                PhoneNumber = request.CustomerPhone, 
                AuthProvider = "guest", 
                IsActive = true, 
                EmailVerified = false 
            };
            _db.Users.Add(customer);
            _db.UserRoles.Add(new UserRole { UserId = customer.UserId, RoleId = customerRole.RoleId });
        }

        Guid? deliveryAddressId = null;
        if (request.DeliveryMethod == DeliveryMethod.Delivery && request.DeliveryAddress is not null) {
            var addr = request.DeliveryAddress;
            var address = new Address { 
                AddressId = Guid.NewGuid(), 
                UserId = customer.UserId, 
                Line1 = addr.Line1, 
                Line2 = addr.Line2, 
                City = addr.City, 
                ProvinceState = addr.ProvinceState, 
                PostalCode = addr.PostalCode, 
                Country = addr.Country, 
                IsDefault = false 
            };
            _db.Addresses.Add(address);
            deliveryAddressId = address.AddressId;
        }

        var orderItems = new List<OrderItem>();
        decimal subtotal = 0m;
        foreach (var (itemInput, index) in request.Items.Select((x, i) => (x, i))) {
            var cake = await _db.Cakes
                .Include(c => c.CustomizationGroups).ThenInclude(cg => cg.Group).ThenInclude(g => g.Options)
                .Include(c => c.TextFields)
                .SingleOrDefaultAsync(c => c.CakeId == itemInput.CakeId, ct);
                
            if (cake is null || !cake.IsActive) { 
                errors.Add($"Item {index + 1}: Cake not found or is unavailable."); 
                continue; 
            }

            var applicableGroups = cake.CustomizationGroups.ToList();
            var allValidOptionIds = applicableGroups.SelectMany(cg => cg.Group.Options).Select(o => o.OptionId).ToHashSet();
            var unknownOptions = itemInput.SelectedOptionIds.Where(id => !allValidOptionIds.Contains(id)).ToList();
            
            if (unknownOptions.Count > 0) { 
                errors.Add($"Item {index + 1}: One or more selected options do not apply to this cake."); 
                continue; 
            }

            var selections = new List<OrderItemCustomizationSelection>();
            decimal optionsTotal = 0m;
            bool itemValid = true;
            
            foreach (var groupMapping in applicableGroups) {
                var group = groupMapping.Group;
                var selectedInGroup = group.Options.Where(o => itemInput.SelectedOptionIds.Contains(o.OptionId)).ToList();
                
                if (groupMapping.IsRequired && selectedInGroup.Count < groupMapping.MinSelections) { 
                    errors.Add($"Item {index + 1}: '{group.Name}' requires at least {groupMapping.MinSelections} selection(s)."); 
                    itemValid = false; 
                    continue; 
                }
                
                if (selectedInGroup.Count > groupMapping.MaxSelections) { 
                    errors.Add($"Item {index + 1}: '{group.Name}' allows at most {groupMapping.MaxSelections} selection(s)."); 
                    itemValid = false; 
                    continue; 
                }
                
                foreach (var option in selectedInGroup) {
                    if (!option.IsAvailable) { 
                        errors.Add($"Item {index + 1}: Option '{option.Label}' is currently unavailable."); 
                        itemValid = false; 
                        continue; 
                    }
                    optionsTotal += option.PriceModifier;
                    selections.Add(new OrderItemCustomizationSelection { 
                        Id = Guid.NewGuid(), 
                        OptionId = option.OptionId, 
                        OptionLabelSnapshot = option.Label, 
                        GroupNameSnapshot = group.Name, 
                        PriceModifier = option.PriceModifier 
                    });
                }
            }

            var textField = cake.TextFields.FirstOrDefault();
            if (textField is not null) {
                if (textField.IsRequired && string.IsNullOrWhiteSpace(itemInput.CustomText)) { 
                    errors.Add($"Item {index + 1}: '{textField.Label}' is required."); 
                    itemValid = false; 
                }
                if (itemInput.CustomText is { Length: > 0 } text && text.Length > textField.MaxLength) { 
                    errors.Add($"Item {index + 1}: '{textField.Label}' exceeds max length of {textField.MaxLength}."); 
                    itemValid = false; 
                }
            }

            if (!itemValid) continue;

            var unitPrice = cake.BasePrice + optionsTotal;
            var lineTotal = unitPrice * itemInput.Quantity;
            subtotal += lineTotal;
            
            var snapshotJson = JsonSerializer.Serialize(selections.Select(s => new { group = s.GroupNameSnapshot, option = s.OptionLabelSnapshot, priceModifier = s.PriceModifier }));
            
            orderItems.Add(new OrderItem { 
                OrderItemId = Guid.NewGuid(), 
                CakeId = cake.CakeId, 
                CakeNameSnapshot = cake.Name, 
                Quantity = itemInput.Quantity, 
                CustomText = itemInput.CustomText, 
                UnitPrice = unitPrice, 
                LineTotal = lineTotal, 
                SelectedCustomizationsJson = snapshotJson, 
                Selections = selections 
            });
        }

        if (errors.Count > 0) return new PlaceOrderResult.ValidationFailed(errors);

        const decimal flatDeliveryFee = 50.00m;
        var deliveryFee = request.DeliveryMethod == DeliveryMethod.Delivery ? flatDeliveryFee : 0m;
        var totalAmount = subtotal + deliveryFee;
        var orderNumber = $"CK-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
        
        var order = new Order { 
            OrderId = Guid.NewGuid(), 
            OrderNumber = orderNumber, 
            UserId = customer.UserId, 
            Status = OrderStatus.PendingPayment, 
            DeliveryMethod = request.DeliveryMethod, 
            DeliveryAddressId = deliveryAddressId, 
            RequestedDate = request.RequestedDate, 
            Subtotal = subtotal, 
            DeliveryFee = deliveryFee, 
            TaxAmount = 0m, 
            TotalAmount = totalAmount, 
            Items = orderItems 
        };
        
        order.StatusHistory.Add(new OrderStatusHistory { 
            Id = Guid.NewGuid(), 
            OrderId = order.OrderId, 
            Status = OrderStatus.PendingPayment, 
            Note = "Order created." 
        });

        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct);

        // ---- REAL-TIME BROADCAST VIA SIGNALR ----
        // Pushes the new order instantly to all connected admin dashboards
        await _hubContext.Clients.All.SendAsync("ReceiveNewOrder", new {
            orderId = order.OrderId,
            orderNumber = order.OrderNumber,
            customerName = request.CustomerFullName,
            totalAmount = order.TotalAmount,
            status = order.Status,
            requestedDate = order.RequestedDate,
            createdAt = order.CreatedAt
        }, ct);

        return new PlaceOrderResult.Success(order.OrderId, order.OrderNumber, order.TotalAmount, order.Status);
    }
}
