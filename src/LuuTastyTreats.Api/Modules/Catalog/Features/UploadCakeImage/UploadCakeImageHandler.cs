using LuuTastyTreats.Api.Modules.Catalog.Domain;
using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Shared.Infrastructure.Uploads;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.UploadCakeImage;

public class UploadCakeImageHandler : IRequestHandler<UploadCakeImageCommand, UploadCakeImageResult> {
    private readonly AppDbContext _db;
    private readonly UploadOptions _options;
    
    // Cloudinary credentials
    private readonly string _cloudinaryUrl = "cloudinary://521761483369234:knltFrq6PtOiK_5CbkIB9iipl-c@xi4sap4e";

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
        
        var cloudinary = new Cloudinary(_cloudinaryUrl);
        cloudinary.Api.Secure = true;

        var uploadResult = new ImageUploadResult();
        
        using (var stream = file.OpenReadStream())
        {
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(file.FileName, stream),
                Folder = $"cakes/{cake.CakeId}"
            };
            uploadResult = await cloudinary.UploadAsync(uploadParams);
        }

        var permanentUrl = uploadResult.SecureUrl.ToString();

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