using LuuTastyTreats.Api.Shared.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.DeleteCakeImage;
public class DeleteCakeImageHandler : IRequestHandler<DeleteCakeImageCommand, bool> {
    private readonly AppDbContext _db; private readonly IWebHostEnvironment _env;
    public DeleteCakeImageHandler(AppDbContext db, IWebHostEnvironment env) { _db = db; _env = env; }
    public async Task<bool> Handle(DeleteCakeImageCommand request, CancellationToken ct) {
        var image = await _db.CakeImages.SingleOrDefaultAsync(i => i.ImageId == request.ImageId, ct);
        if (image is null) return false;
        var physicalPath = Path.Combine(_env.ContentRootPath, image.ImageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(physicalPath)) { try { File.Delete(physicalPath); } catch {} }
        _db.CakeImages.Remove(image); await _db.SaveChangesAsync(ct); return true;
    }
}
