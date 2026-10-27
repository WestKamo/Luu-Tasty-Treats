using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Shared.Infrastructure.Uploads;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.DeleteCakeImage;

/// <summary>
/// Removes Supabase objects for new photos, while preserving legacy Cloudinary
/// and local-image compatibility and the existing SuperAdminOnly API endpoint.
/// </summary>
public sealed class DeleteCakeImageHandler : IRequestHandler<DeleteCakeImageCommand, bool>
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly SupabaseCakeStorage _storage;
    private readonly ILogger<DeleteCakeImageHandler> _logger;

    public DeleteCakeImageHandler(
        AppDbContext db,
        IWebHostEnvironment env,
        SupabaseCakeStorage storage,
        ILogger<DeleteCakeImageHandler> logger)
    {
        _db = db;
        _env = env;
        _storage = storage;
        _logger = logger;
    }

    public async Task<bool> Handle(DeleteCakeImageCommand request, CancellationToken ct)
    {
        var image = await _db.CakeImages.SingleOrDefaultAsync(i => i.ImageId == request.ImageId, ct);
        if (image is null)
            return false;

        // Do not remove the database row if deleting its managed Supabase object fails.
        // Existing Cloudinary URLs remain readable and are not sent to Supabase.
        if (!await _storage.DeleteIfManagedAsync(image.ImageUrl, ct))
            throw new InvalidOperationException("Could not remove the image from Supabase Storage.");

        // Only touch server-local files for old /uploads/ URLs; never use a remote
        // HTTPS URL as a filesystem path.
        if (image.ImageUrl.StartsWith("/uploads/", StringComparison.Ordinal) &&
            !image.ImageUrl.Contains("..", StringComparison.Ordinal))
        {
            var relative = image.ImageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var physicalPath = Path.Combine(_env.ContentRootPath, relative);
            if (File.Exists(physicalPath))
            {
                try { File.Delete(physicalPath); }
                catch (IOException ex)
                {
                    _logger.LogWarning(ex, "Could not remove legacy local cake image.");
                }
                catch (UnauthorizedAccessException ex)
                {
                    _logger.LogWarning(ex, "Permission denied removing legacy local cake image.");
                }
            }
        }

        // Prevent the public catalog from retaining a dangling primary image URL.
        var cake = await _db.Cakes.SingleOrDefaultAsync(c => c.CakeId == image.CakeId, ct);
        if (cake is not null && cake.BaseImageUrl == image.ImageUrl)
        {
            var replacement = await _db.CakeImages.AsNoTracking()
                .Where(i => i.CakeId == image.CakeId && i.ImageId != image.ImageId)
                .OrderBy(i => i.DisplayOrder).ThenBy(i => i.ImageId)
                .Select(i => i.ImageUrl)
                .FirstOrDefaultAsync(ct);

            cake.BaseImageUrl = replacement ?? "";
            if (replacement is null)
                cake.IsActive = false;
        }

        _db.CakeImages.Remove(image);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
