using LuuTastyTreats.Api.Modules.Catalog.Domain;
using LuuTastyTreats.Api.Shared.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.CreateCake;

public class CreateCakeHandler : IRequestHandler<CreateCakeCommand, CreateCakeResult>
{
    private const string PlaceholderImageUrl = "https://placehold.co/600x400?text=New+Cake";
    private readonly AppDbContext _db;

    public CreateCakeHandler(AppDbContext db) => _db = db;

    public async Task<CreateCakeResult> Handle(CreateCakeCommand request, CancellationToken ct)
    {
        if (request.CategoryId is not null)
        {
            var categoryExists = await _db.Categories.AnyAsync(c => c.CategoryId == request.CategoryId, ct);
            if (!categoryExists)
                return new CreateCakeResult.CategoryNotFound();
        }

        var cake = new Cake
        {
            CakeId = Guid.NewGuid(),
            CategoryId = request.CategoryId,
            Name = request.Name,
            Description = request.Description,
            BasePrice = request.BasePrice,
            BaseImageUrl = PlaceholderImageUrl,
            IsActive = false,
            IsFeatured = false
        };

        _db.Cakes.Add(cake);
        await _db.SaveChangesAsync(ct);

        return new CreateCakeResult.Success(cake.CakeId, cake.Name, cake.BasePrice, cake.BaseImageUrl, cake.IsActive);
    }
}
