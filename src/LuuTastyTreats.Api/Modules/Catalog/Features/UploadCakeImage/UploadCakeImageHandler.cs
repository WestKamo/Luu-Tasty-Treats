using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LuuTastyTreats.Api.Modules.Catalog.Domain;
using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Shared.Infrastructure.Uploads;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.UploadCakeImage;

/// <summary>
/// Firebase/role authorization is enforced by the existing SuperAdminOnly endpoint.
/// This handler now uploads to Supabase Storage, keeping existing DTOs and PostgreSQL.
/// </summary>
public sealed class UploadCakeImageHandler : IRequestHandler<UploadCakeImageCommand, UploadCakeImageResult>
{
    private readonly AppDbContext _db;
    private readonly UploadOptions _options;
    private readonly SupabaseCakeStorage _storage;
    private readonly ILogger<UploadCakeImageHandler> _logger;

    public UploadCakeImageHandler(
        AppDbContext db,
        IOptions<UploadOptions> options,
        SupabaseCakeStorage storage,
        ILogger<UploadCakeImageHandler> logger)
    {
        _db = db;
        _options = options.Value;
        _storage = storage;
        _logger = logger;
    }

    public async Task<UploadCakeImageResult> Handle(UploadCakeImageCommand request, CancellationToken ct)
    {
        var cake = await _db.Cakes.SingleOrDefaultAsync(c => c.CakeId == request.CakeId, ct);
        if (cake is null)
            return new UploadCakeImageResult.CakeNotFound();

        var file = request.File;
        if (file is null || file.Length == 0)
            return new UploadCakeImageResult.InvalidFile("Please select a non-empty image.");

        if (_options.MaxFileSizeMb <= 0)
        {
            _logger.LogError("Uploads:MaxFileSizeMb must be greater than zero.");
            return new UploadCakeImageResult.InvalidFile("Image upload configuration is invalid.");
        }

        long maxBytes = (long)_options.MaxFileSizeMb * 1024L * 1024L;
        if (file.Length > maxBytes)
            return new UploadCakeImageResult.InvalidFile($"Image exceeds the {_options.MaxFileSizeMb} MB limit.");

        var extension = Path.GetExtension(file.FileName);
        if (_options.AllowedExtensions is null ||
            !_options.AllowedExtensions.Any(e => string.Equals(e, extension, StringComparison.OrdinalIgnoreCase)))
            return new UploadCakeImageResult.InvalidFile("Use a JPG, PNG, or WebP image.");

        var contentType = file.ContentType?.ToLowerInvariant();
        if (contentType is not ("image/jpeg" or "image/png" or "image/webp"))
            return new UploadCakeImageResult.InvalidFile("Unsupported image content type.");

        if (request.DisplayOrder < 1)
            return new UploadCakeImageResult.InvalidFile("Image display order must be at least one.");

        var imageId = Guid.NewGuid();
        var upload = await _storage.UploadAsync(cake.CakeId, imageId, file, ct);

        if (string.IsNullOrWhiteSpace(upload.PublicUrl))
            return new UploadCakeImageResult.InvalidFile(
                upload.Error ?? "Photo upload failed. Check Render logs.");

        // Keep the current public DTO, image ordering and activation behaviour.
        var image = new CakeImage
        {
            ImageId = imageId,
            CakeId = cake.CakeId,
            ImageUrl = upload.PublicUrl,
            DisplayOrder = request.DisplayOrder
        };
        _db.CakeImages.Add(image);

        if (request.DisplayOrder == 1)
        {
            cake.BaseImageUrl = upload.PublicUrl;
            cake.IsActive = true;
        }

        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Supabase upload succeeded but saving cake {CakeId} failed.", cake.CakeId);
            // Best-effort cleanup of an orphaned Storage object.
            await _storage.DeleteIfManagedAsync(upload.PublicUrl, CancellationToken.None);
            throw;
        }

        _logger.LogInformation("Supabase image {ImageId} saved for cake {CakeId}.", image.ImageId, cake.CakeId);
        return new UploadCakeImageResult.Success(image.ImageId, upload.PublicUrl);
    }
}
