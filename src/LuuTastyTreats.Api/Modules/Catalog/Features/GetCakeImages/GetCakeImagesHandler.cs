using LuuTastyTreats.Api.Shared.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.GetCakeImages;
public class GetCakeImagesHandler : IRequestHandler<GetCakeImagesQuery, List<CakeImageDto>> {
    private readonly AppDbContext _db;
    public GetCakeImagesHandler(AppDbContext db) => _db = db;
    public async Task<List<CakeImageDto>> Handle(GetCakeImagesQuery request, CancellationToken ct) {
        return await _db.CakeImages.AsNoTracking().Where(i => i.CakeId == request.CakeId).OrderBy(i => i.DisplayOrder).Select(i => new CakeImageDto(i.ImageId, i.ImageUrl, i.DisplayOrder)).ToListAsync(ct);
    }
}
