using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace LuuTastyTreats.Api.Modules.Orders.Hubs;

[Authorize(Policy = "SuperAdminOnly")]
public class AdminOrderHub : Hub
{
    // Clients automatically join this hub upon successful authentication.
    // We can also organize them into groups if needed later.
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
