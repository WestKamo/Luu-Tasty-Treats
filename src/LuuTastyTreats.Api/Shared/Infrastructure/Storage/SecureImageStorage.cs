using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
namespace LuuTastyTreats.Api.Shared.Infrastructure.Storage;
public interface ISecureImageStorage {
    Task<string> SaveAndOptimizeAsync(IFormFile file, CancellationToken ct);
    Task DeleteAsync(string imageUrl, CancellationToken ct);
}
public class SecureImageStorage : ISecureImageStorage {
    private readonly IWebHostEnvironment _env;
    public SecureImageStorage(IWebHostEnvironment env) => _env = env;
    public async Task<string> SaveAndOptimizeAsync(IFormFile file, CancellationToken ct) {
        if (file.Length == 0 || file.Length > 10 * 1024 * 1024) throw new ArgumentException("Invalid file size.");
        
        var uploadsFolder = Path.Combine(_env.ContentRootPath, "uploads");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
        
        var fileName = $"cake-{Guid.NewGuid()}.jpg";
        var filePath = Path.Combine(uploadsFolder, fileName);
        
        using (var stream = new FileStream(filePath, FileMode.Create)) {
            await file.CopyToAsync(stream, ct);
        }
        return $"/uploads/{fileName}";
    }
    public Task DeleteAsync(string imageUrl, CancellationToken ct) {
        var physicalPath = Path.Combine(_env.ContentRootPath, imageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(physicalPath)) { try { File.Delete(physicalPath); } catch {} }
        return Task.CompletedTask;
    }
}
