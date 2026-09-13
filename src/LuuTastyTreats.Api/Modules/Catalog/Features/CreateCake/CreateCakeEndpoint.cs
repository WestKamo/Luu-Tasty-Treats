using MediatR;
using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Modules.Catalog.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.CreateCake;

public record CreateCakeCommand(string Name, string? Description, decimal BasePrice, bool IsActive) : IRequest<Guid>;

public class CreateCakeHandler : IRequestHandler<CreateCakeCommand, Guid> {
    private readonly AppDbContext _db;
    public CreateCakeHandler(AppDbContext db) => _db = db;
    
    public async Task<Guid> Handle(CreateCakeCommand request, CancellationToken ct) {
        // Find the default category from the database so PostgreSQL doesn't reject the save
        var defaultCategory = await _db.Categories.FirstOrDefaultAsync(ct);
        
        var cake = new Cake {
            CakeId = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            BasePrice = request.BasePrice,
            IsActive = request.IsActive,
            IsFeatured = false,
            Category = defaultCategory // This satisfies the database requirement!
        };
        
        _db.Cakes.Add(cake);
        await _db.SaveChangesAsync(ct);
        return cake.CakeId;
    }
}

public static class CreateCakeEndpoint {
    public static void MapCreateCakeEndpoint(this RouteGroupBuilder group) {
        group.MapPost("/admin/cakes", async ([FromBody] CreateCakeCommand command, IMediator mediator, CancellationToken ct) => {
            var id = await mediator.Send(command, ct);
            return Results.Ok(new { CakeId = id });
        }).RequireAuthorization("AdminOrAbove");
    }
}
