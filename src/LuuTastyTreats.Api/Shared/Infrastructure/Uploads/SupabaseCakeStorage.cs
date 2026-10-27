using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LuuTastyTreats.Api.Shared.Infrastructure.Uploads;

/// <summary>
/// Sends Admin-approved cake photos from the trusted .NET backend to a public
/// Supabase Storage bucket. Supabase privileged keys are never sent to browsers.
/// Existing Cloudinary image URLs can still be displayed by the storefront.
/// </summary>
public sealed class SupabaseCakeStorage
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _clients;
    private readonly ILogger<SupabaseCakeStorage> _logger;

    public SupabaseCakeStorage(
        IConfiguration config,
        IHttpClientFactory clients,
        ILogger<SupabaseCakeStorage> logger)
    {
        _config = config;
        _clients = clients;
        _logger = logger;
    }

    public sealed record UploadResult(string? PublicUrl, string? Error);

    public async Task<UploadResult> UploadAsync(
        Guid cakeId, Guid imageId, IFormFile file, CancellationToken ct)
    {
        if (!TryGetSettings(out var projectUrl, out var secretKey, out var bucket))
        {
            _logger.LogError(
                "Supabase image upload is not configured: SUPABASE_URL, " +
                "SUPABASE_SECRET_KEY, and a public cake-images bucket are required.");
            return new UploadResult(null,
                "Photo storage is not configured. Set Supabase settings in Render.");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var objectPath = $"cakes/{cakeId:D}/{imageId:N}{extension}";
        var encodedPath = $"cakes/{cakeId:D}/{imageId:N}{extension}";
        var uploadUrl =
            $"{projectUrl}/storage/v1/object/{Uri.EscapeDataString(bucket)}/{encodedPath}";
        var publicUrl =
            $"{projectUrl}/storage/v1/object/public/{Uri.EscapeDataString(bucket)}/{encodedPath}";

        try
        {
            using var stream = file.OpenReadStream();
            using var request = new HttpRequestMessage(HttpMethod.Post, uploadUrl);
            request.Content = new StreamContent(stream);
            request.Content.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);
            request.Headers.TryAddWithoutValidation("x-upsert", "false");
            SetApiKey(request, secretKey);

            using var response = await _clients.CreateClient().SendAsync(
                request, HttpCompletionOption.ResponseHeadersRead, ct);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError(
                    "Supabase Storage upload rejected cake {CakeId}: HTTP {Status}, {Reason}",
                    cakeId, (int)response.StatusCode, ExtractErrorMessage(body));
                return new UploadResult(null,
                    $"Photo storage rejected the image (HTTP {(int)response.StatusCode}). Check Render logs.");
            }

            // The object has been accepted by Supabase. Its public bucket URL is stable
            // and is stored in the existing catalog.cake_images.image_url field.
            return new UploadResult(publicUrl, null);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Supabase Storage network error uploading cake {CakeId}.", cakeId);
            return new UploadResult(null, "Photo storage is unreachable. Retry the upload.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected Supabase Storage upload error for cake {CakeId}.", cakeId);
            return new UploadResult(null, "Photo storage failed. Check Render logs.");
        }
    }

    /// <summary>
    /// Delete only objects in OUR configured Supabase bucket. Old Cloudinary and
    /// local /uploads URLs are left untouched and remain valid database references.
    /// Returns false if a matching Supabase object could not be deleted.
    /// </summary>
    public async Task<bool> DeleteIfManagedAsync(string imageUrl, CancellationToken ct)
    {
        if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var imageUri))
            return true; // Legacy relative local upload.

        var configuredProject = (_config["SUPABASE_URL"] ?? "").Trim().TrimEnd('/');
        if (!Uri.TryCreate(configuredProject, UriKind.Absolute, out var projectUri) ||
            !Uri.Compare(projectUri, imageUri, UriComponents.SchemeAndServer,
                UriFormat.Unescaped, StringComparison.OrdinalIgnoreCase).Equals(0))
            return true; // Other host: existing Cloudinary or unrelated image.

        if (!TryGetSettings(out var projectUrl, out var secretKey, out var bucket))
        {
            _logger.LogError("Supabase is not configured for deleting a hosted image.");
            return false;
        }

        var publicPrefix = $"/storage/v1/object/public/{Uri.EscapeDataString(bucket)}/";
        if (!imageUri.AbsolutePath.StartsWith(publicPrefix, StringComparison.Ordinal))
            return true;

        var encodedPath = imageUri.AbsolutePath.Substring(publicPrefix.Length);
        if (string.IsNullOrWhiteSpace(encodedPath) ||
            encodedPath.Contains("..", StringComparison.Ordinal) ||
            encodedPath.Contains('\\') ||
            !encodedPath.StartsWith("cakes/", StringComparison.Ordinal))
        {
            _logger.LogWarning("Refused to delete unexpected Supabase Storage image path.");
            return false;
        }

        try
        {
            var deleteUrl =
                $"{projectUrl}/storage/v1/object/{Uri.EscapeDataString(bucket)}/{encodedPath}";
            using var request = new HttpRequestMessage(HttpMethod.Delete, deleteUrl);
            SetApiKey(request, secretKey);
            using var response = await _clients.CreateClient().SendAsync(request, ct);

            if (response.IsSuccessStatusCode || response.StatusCode == HttpStatusCode.NotFound)
                return true;

            var body = await response.Content.ReadAsStringAsync(ct);
            _logger.LogError(
                "Supabase Storage delete failed: HTTP {Status}, {Reason}",
                (int)response.StatusCode, ExtractErrorMessage(body));
            return false;
        }
        catch (Exception ex) when (ex is not OperationCanceledException || !ct.IsCancellationRequested)
        {
            _logger.LogError(ex, "Supabase Storage delete request failed.");
            return false;
        }
    }

    private bool TryGetSettings(
        out string projectUrl, out string secretKey, out string bucket)
    {
        projectUrl = (_config["SUPABASE_URL"] ?? "").Trim().TrimEnd('/');
        secretKey = (_config["SUPABASE_SECRET_KEY"]
            ?? _config["SUPABASE_SERVICE_ROLE_KEY"] ?? "").Trim();
        bucket = (_config["SUPABASE_STORAGE_BUCKET"] ?? "cake-images").Trim();

        return Uri.TryCreate(projectUrl, UriKind.Absolute, out var uri)
            && uri.Scheme == Uri.UriSchemeHttps
            && string.IsNullOrEmpty(uri.UserInfo)
            && (uri.AbsolutePath == "/" || uri.AbsolutePath == "")
            && !string.IsNullOrWhiteSpace(secretKey)
            && Regex.IsMatch(bucket, @"^[A-Za-z0-9][A-Za-z0-9_-]*$");
    }

    private static void SetApiKey(HttpRequestMessage request, string secretKey)
    {
        // sb_secret_* keys are NOT JWTs: send on apikey only.
        // Legacy JWT service_role keys also support bearer authorization.
        request.Headers.TryAddWithoutValidation("apikey", secretKey);
        if (!secretKey.StartsWith("sb_secret_", StringComparison.Ordinal))
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", secretKey);
    }

    private static string ExtractErrorMessage(string body)
    {
        try
        {
            using var json = JsonDocument.Parse(body);
            foreach (var field in new[] { "message", "error", "error_description" })
            {
                if (json.RootElement.TryGetProperty(field, out var value) &&
                    value.ValueKind == JsonValueKind.String)
                {
                    var message = value.GetString() ?? "";
                    return message.Length > 250 ? message[..250] : message;
                }
            }
        }
        catch (JsonException)
        {
            // Provider sent a non-JSON error; don't log raw responses.
        }
        return "No structured error details returned.";
    }
}
