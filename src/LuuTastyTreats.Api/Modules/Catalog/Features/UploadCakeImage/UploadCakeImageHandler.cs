using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using LuuTastyTreats.Api.Modules.Catalog.Domain;
using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Shared.Infrastructure.Uploads;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.UploadCakeImage;

public sealed class UploadCakeImageHandler : IRequestHandler<UploadCakeImageCommand, UploadCakeImageResult>
{
    private readonly AppDbContext _db;
    private readonly UploadOptions _options;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UploadCakeImageHandler> _logger;

    public UploadCakeImageHandler(
        AppDbContext db,
        IOptions<UploadOptions> options,
        IConfiguration configuration,
        ILogger<UploadCakeImageHandler> logger)
    {
        _db = db;
        _options = options.Value;
        _configuration = configuration;
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
            return new UploadCakeImageResult.InvalidFile("Image upload is not configured correctly.");
        }

        long maxBytes = (long)_options.MaxFileSizeMb * 1024L * 1024L;
        if (file.Length > maxBytes)
            return new UploadCakeImageResult.InvalidFile($"Image exceeds the {_options.MaxFileSizeMb} MB limit.");

        var extension = Path.GetExtension(file.FileName);
        if (_options.AllowedExtensions is null ||
            !_options.AllowedExtensions.Any(x => string.Equals(x, extension, StringComparison.OrdinalIgnoreCase)))
            return new UploadCakeImageResult.InvalidFile("Use a JPG, PNG, or WebP image.");

        var type = file.ContentType?.ToLowerInvariant();
        if (type is not ("image/jpeg" or "image/png" or "image/webp"))
            return new UploadCakeImageResult.InvalidFile("Unsupported image content type.");

        if (request.DisplayOrder < 1)
            return new UploadCakeImageResult.InvalidFile("Image display order must be at least one.");

        // Credentials belong in Render/local configuration, never in source control.
        var cloudinaryUrl = _configuration["CLOUDINARY_URL"];
        if (string.IsNullOrWhiteSpace(cloudinaryUrl))
            cloudinaryUrl = _configuration["Cloudinary:Url"];

        if (string.IsNullOrWhiteSpace(cloudinaryUrl))
        {
            _logger.LogError("Cloudinary upload unavailable: CLOUDINARY_URL is not configured.");
            return new UploadCakeImageResult.InvalidFile("Photo storage is not configured. Contact support.");
        }

        ImageUploadResult uploadResult;
        try
        {
            var cloudinary = new Cloudinary(cloudinaryUrl);
            cloudinary.Api.Secure = true;

            // Keep the multipart stream open until Cloudinary completes the upload.
            using var stream = file.OpenReadStream();
            if (stream.CanSeek)
                stream.Position = 0;

            var parameters = new ImageUploadParams
            {
                File = new FileDescription(Path.GetFileName(file.FileName), stream),
                Folder = $"cakes/{cake.CakeId}"
            };

            uploadResult = await cloudinary.UploadAsync(parameters);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Cloudinary upload request failed for cake {CakeId}.", cake.CakeId);
            return new UploadCakeImageResult.InvalidFile(
                "Photo upload failed. Check backend logs for the Cloudinary error.");
        }

        if (uploadResult is null)
        {
            _logger.LogError("Cloudinary returned no response for cake {CakeId}.", cake.CakeId);
            return new UploadCakeImageResult.InvalidFile("Photo storage returned no response.");
        }

        if (uploadResult.Error is not null)
        {
            // Log provider reason on the server, but do not expose account details to clients.
            _logger.LogError("Cloudinary rejected cake {CakeId}: {CloudinaryError}",
                cake.CakeId, uploadResult.Error.Message);
            return new UploadCakeImageResult.InvalidFile(
                "Cloudinary rejected this image. Check Render logs for the exact reason.");
        }

        var permanentUrl = uploadResult.SecureUrl?.ToString();
        if (string.IsNullOrWhiteSpace(permanentUrl) ||
            !Uri.TryCreate(permanentUrl, UriKind.Absolute, out var imageUri) ||
            imageUri.Scheme != Uri.UriSchemeHttps)
        {
            _logger.LogError(
                "Cloudinary returned an invalid HTTPS image URL for cake {CakeId}; status {StatusCode}.",
                cake.CakeId, uploadResult.StatusCode);
            return new UploadCakeImageResult.InvalidFile("Photo storage returned an invalid image URL.");
        }

        var image = new CakeImage
        {
            ImageId = Guid.NewGuid(),
            CakeId = cake.CakeId,
            ImageUrl = permanentUrl,
            DisplayOrder = request.DisplayOrder
        };
        _db.CakeImages.Add(image);

        if (request.DisplayOrder == 1)
        {
            cake.BaseImageUrl = permanentUrl;
            cake.IsActive = true;
        }

        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Cloudinary upload succeeded but database save failed for cake {CakeId}.", cake.CakeId);
            throw;
        }

        _logger.LogInformation("Cloudinary image {ImageId} saved for cake {CakeId}.", image.ImageId, cake.CakeId);
        return new UploadCakeImageResult.Success(image.ImageId, permanentUrl);
    }
}
