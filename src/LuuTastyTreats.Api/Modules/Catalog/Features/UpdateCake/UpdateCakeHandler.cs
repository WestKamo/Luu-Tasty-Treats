using LuuTastyTreats.Api.Shared.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.UpdateCake;
public class UpdateCakeHandler : IRequestHandler<UpdateCakeCommand, UpdateCakeResult> {
    private readonly AppDbContext _db;
    public UpdateCakeHandler(AppDbContext db) => _db = db;
    public async Task<UpdateCakeResult> Handle(UpdateCakeCommand request, CancellationToken ct) {
        var cake = await _db.Cakes.SingleOrDefaultAsync(c => c.CakeId == request.CakeId, ct);
        if (cake is null) return new UpdateCakeResult.CakeNotFound();
        if (request.CategoryId is not null) {
            var categoryExists = await _db.Categories.AnyAsync(c => c.CategoryId == request.CategoryId, ct);
            if (!categoryExists) return new UpdateCakeResult.CategoryNotFound();
        }
        cake.Name = request.Name;
        cake.Description = request.Description;
        cake.BasePrice = request.BasePrice;
        cake.IsActive = request.IsActive;
        cake.CategoryId = request.CategoryId;
        cake.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);
        return new UpdateCakeResult.Success(cake.CakeId, cake.Name, cake.BasePrice, cake.IsActive);
    }
}
