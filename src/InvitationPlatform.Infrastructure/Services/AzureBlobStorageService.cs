using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace InvitationPlatform.Infrastructure.Services;

public class AzureBlobStorageService : IFileStorageService
{
    private readonly BlobContainerClient _containerClient;
    private readonly string _cdnBaseUrl;
    private readonly bool _useSasUrls;
    private readonly TimeSpan _sasExpiry;

    public AzureBlobStorageService(string connectionString, string containerName, string? cdnBaseUrl = null, bool useSasUrls = false, TimeSpan? sasExpiry = null)
    {
        var serviceClient = new BlobServiceClient(connectionString);
        _containerClient = serviceClient.GetBlobContainerClient(containerName);
        _containerClient.CreateIfNotExists(
            useSasUrls ? PublicAccessType.None : PublicAccessType.Blob);
        
        _cdnBaseUrl = cdnBaseUrl?.TrimEnd('/') ?? _containerClient.Uri.ToString().TrimEnd('/');
        _useSasUrls = useSasUrls;
        _sasExpiry = sasExpiry ?? TimeSpan.FromHours(1);
    }

    public async Task<string> SaveFileAsync(Guid tenantId, Guid eventId, string mediaType, Stream fileStream, string extension)
    {
        var fileName = $"{Guid.NewGuid()}{extension}";
        var blobPath = $"tenants/{tenantId}/events/{eventId}/{mediaType}/{fileName}";
        
        var blobClient = _containerClient.GetBlobClient(blobPath);
        
        var contentType = GetContentType(extension);
        var options = new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders { ContentType = contentType }
        };
        
        await blobClient.UploadAsync(fileStream, options);
        
        return blobPath;
    }

    public async Task<string?> GenerateThumbnailAsync(Guid tenantId, Guid eventId, string storedFileName, int maxWidth = 400)
    {
        var sourceBlobClient = _containerClient.GetBlobClient(storedFileName);
        if (!await sourceBlobClient.ExistsAsync())
            return null;

        using var downloadStream = new MemoryStream();
        await sourceBlobClient.DownloadToAsync(downloadStream);
        downloadStream.Position = 0;

        using var image = await Image.LoadAsync(downloadStream);
        if (image.Width > maxWidth)
        {
            image.Mutate(x => x.Resize(maxWidth, 0));
        }

        var thumbPath = Path.ChangeExtension(storedFileName, null);
        var thumbBlobPath = $"{Path.GetDirectoryName(storedFileName)}/thumb_{Path.GetFileNameWithoutExtension(storedFileName)}.webp"
            .Replace('\\', '/');

        using var thumbStream = new MemoryStream();
        await image.SaveAsWebpAsync(thumbStream);
        thumbStream.Position = 0;

        var thumbBlobClient = _containerClient.GetBlobClient(thumbBlobPath);
        var options = new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders { ContentType = "image/webp" }
        };
        await thumbBlobClient.UploadAsync(thumbStream, options);

        return thumbBlobPath;
    }

    public async Task DeleteFileAsync(string storedPath)
    {
        var blobClient = _containerClient.GetBlobClient(storedPath);
        await blobClient.DeleteIfExistsAsync();
    }

    public string GetFileUrl(string storedPath)
    {
        if (_useSasUrls)
        {
            var blobClient = _containerClient.GetBlobClient(storedPath);
            if (blobClient.CanGenerateSasUri)
            {
                var sasBuilder = new BlobSasBuilder
                {
                    BlobContainerName = _containerClient.Name,
                    BlobName = storedPath,
                    Resource = "b",
                    ExpiresOn = DateTimeOffset.UtcNow.Add(_sasExpiry)
                };
                sasBuilder.SetPermissions(BlobSasPermissions.Read);
                return blobClient.GenerateSasUri(sasBuilder).ToString();
            }
        }
        
        return $"{_cdnBaseUrl}/{storedPath}";
    }

    public Stream? OpenRead(string storedPath)
    {
        var blobClient = _containerClient.GetBlobClient(storedPath);
        if (!blobClient.Exists())
            return null;
        
        return blobClient.OpenRead();
    }

    private static string GetContentType(string extension) => extension.ToLowerInvariant() switch
    {
        ".jpg" or ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".gif" => "image/gif",
        ".webp" => "image/webp",
        ".mp4" => "video/mp4",
        ".webm" => "video/webm",
        ".pdf" => "application/pdf",
        ".mp3" => "audio/mpeg",
        ".ogg" => "audio/ogg",
        ".wav" => "audio/wav",
        _ => "application/octet-stream"
    };
}
