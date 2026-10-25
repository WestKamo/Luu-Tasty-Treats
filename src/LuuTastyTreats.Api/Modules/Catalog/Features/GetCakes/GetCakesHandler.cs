using LuuTastyTreats.Api.Shared.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.GetCakes;
public class GetCakesHandler : IRequestHandler<GetCakesQuery, List<CakeSummaryDto>> {
    private readonly AppDbContext _db;
    public GetCakesHandler(AppDbContext db) => _db = db;
    public async Task<List<CakeSummaryDto>> Handle(GetCakesQuery request, CancellationToken ct) {
        var query = _db.Cakes.AsNoTracking().Where(c => c.IsActive);
        if (request.CategoryId is not null) query = query.Where(c => c.CategoryId == request.CategoryId);
        if (request.FeaturedOnly == true) query = query.Where(c => c.IsFeatured);
        return await query.OrderByDescending(c => c.IsFeatured).ThenBy(c => c.Name)
            .Select(c => new CakeSummaryDto(c.CakeId, c.Name, c.Description, c.BasePrice, c.BaseImageUrl, c.IsFeatured, c.Category != null ? c.Category.Name : null))
            .ToListAsync(ct);
    }
}
