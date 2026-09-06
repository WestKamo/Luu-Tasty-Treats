using LuuTastyTreats.Api.Modules.Catalog.Domain;
using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Shared.Infrastructure.Uploads;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.UploadCakeImage;
public class UploadCakeImageHandler : IRequestHandler<UploadCakeImageCommand, UploadCakeImageResult> {
    private readonly AppDbContext _db;
    private readonly UploadOptions _options;
    private readonly IWebHostEnvironment _env;
    public UploadCakeImageHandler(AppDbContext db, IOptions<UploadOptions> options, IWebHostEnvironment env) {
        _db = db; _options = options.Value; _env = env;
    }
    public async Task<UploadCakeImageResult> Handle(UploadCakeImageCommand request, CancellationToken ct) {
        var cake = await _db.Cakes.SingleOrDefaultAsync(c => c.CakeId == request.CakeId, ct);
        if (cake is null) return new UploadCakeImageResult.CakeNotFound();
        var file = request.File;
        if (file.Length == 0) return new UploadCakeImageResult.InvalidFile("File is empty.");
        var maxBytes = _options.MaxFileSizeMb * 1024 * 1024;
        if (file.Length > maxBytes) return new UploadCakeImageResult.InvalidFile($"File exceeds {_options.MaxFileSizeMb}MB limit.");
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_options.AllowedExtensions.Contains(extension)) return new UploadCakeImageResult.InvalidFile($"Extension '{extension}' is not allowed.");
        var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedContentTypes.Contains(file.ContentType.ToLowerInvariant())) return new UploadCakeImageResult.InvalidFile("Invalid content type.");
        var safeFileName = $"{Guid.NewGuid()}{extension}";
        var cakeFolder = Path.Combine(_env.ContentRootPath, _options.RootPath, cake.CakeId.ToString());
        Directory.CreateDirectory(cakeFolder);
        var fullPath = Path.Combine(cakeFolder, safeFileName);
        await using (var stream = new FileStream(fullPath, FileMode.Create)) {
            await file.CopyToAsync(stream, ct);
        }
        var relativeUrl = $"/uploads/cakes/{cake.CakeId}/{safeFileName}";
        var image = new CakeImage { ImageId = Guid.NewGuid(), CakeId = cake.CakeId, ImageUrl = relativeUrl, DisplayOrder = request.DisplayOrder };
        _db.CakeImages.Add(image);
        await _db.SaveChangesAsync(ct);
        return new UploadCakeImageResult.Success(image.ImageId, relativeUrl);
    }
}
