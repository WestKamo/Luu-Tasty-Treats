using LuuTastyTreats.Api.Modules.Catalog.Domain;
using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Shared.Infrastructure.Uploads;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.UploadCakeImage;

public class UploadCakeImageHandler : IRequestHandler<UploadCakeImageCommand, UploadCakeImageResult> {
    private readonly AppDbContext _db;
    private readonly UploadOptions _options;
    // PASTE YOUR FIREBASE BUCKET NAME HERE:
    private readonly string _bucketName = "YOUR_PROJECT_ID.appspot.com"; 

    public UploadCakeImageHandler(AppDbContext db, IOptions<UploadOptions> options) {
        _db = db; 
        _options = options.Value; 
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
        var objectName = $"cakes/{cake.CakeId}/{safeFileName}";

        // --- NEW FIREBASE UPLOAD LOGIC ---
        var storageClient = await StorageClient.CreateAsync();
        using (var memoryStream = new MemoryStream()) {
            await file.CopyToAsync(memoryStream, ct);
            await storageClient.UploadObjectAsync(_bucketName, objectName, file.ContentType, memoryStream, cancellationToken: ct);
        }

        // Generate the permanent public Firebase URL
        var permanentUrl = $"https://firebasestorage.googleapis.com/v0/b/{_bucketName}/o/{Uri.EscapeDataString(objectName)}?alt=media";

        var image = new CakeImage { ImageId = Guid.NewGuid(), CakeId = cake.CakeId, ImageUrl = permanentUrl, DisplayOrder = request.DisplayOrder };
        _db.CakeImages.Add(image);

        if (request.DisplayOrder == 1) { 
            cake.BaseImageUrl = permanentUrl; 
            cake.IsActive = true; 
        }

        await _db.SaveChangesAsync(ct);
        return new UploadCakeImageResult.Success(image.ImageId, permanentUrl);
    }
}
