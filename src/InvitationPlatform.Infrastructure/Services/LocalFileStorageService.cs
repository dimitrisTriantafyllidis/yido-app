using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace InvitationPlatform.Infrastructure.Services;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Guid tenantId, Guid eventId, string mediaType, Stream fileStream, string extension);
    Task<string?> GenerateThumbnailAsync(Guid tenantId, Guid eventId, string storedFileName, int maxWidth = 400);
    Task DeleteFileAsync(string storedPath);
    string GetFileUrl(string storedPath);
    Stream? OpenRead(string storedPath);
}

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _basePath;
    private readonly string _baseUrl;

    public LocalFileStorageService(string basePath, string baseUrl)
    {
        _basePath = basePath;
        _baseUrl = baseUrl;
    }

    public async Task<string> SaveFileAsync(Guid tenantId, Guid eventId, string mediaType, Stream fileStream, string extension)
    {
        var fileName = $"{Guid.NewGuid()}{extension}";
        var relativePath = Path.Combine("tenants", tenantId.ToString(), "events", eventId.ToString(), mediaType, fileName);
        var fullPath = Path.Combine(_basePath, relativePath);

        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

        using var fs = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
        await fileStream.CopyToAsync(fs);

        return relativePath.Replace('\\', '/');
    }

    public async Task<string?> GenerateThumbnailAsync(Guid tenantId, Guid eventId, string storedFileName, int maxWidth = 400)
    {
        var sourcePath = Path.Combine(_basePath, storedFileName.Replace('/', Path.DirectorySeparatorChar));
        if (!File.Exists(sourcePath)) return null;

        var thumbName = $"thumb_{Path.GetFileName(storedFileName)}";
        var thumbRelative = Path.Combine(
            Path.GetDirectoryName(storedFileName)!,
            thumbName
        ).Replace('\\', '/');

        var thumbFullPath = Path.Combine(_basePath, thumbRelative.Replace('/', Path.DirectorySeparatorChar));

        using var image = await Image.LoadAsync(sourcePath);
        if (image.Width > maxWidth)
        {
            image.Mutate(x => x.Resize(maxWidth, 0));
        }

        // Re-encode as WebP for thumbnails
        await image.SaveAsWebpAsync(thumbFullPath.Replace(Path.GetExtension(thumbFullPath), ".webp"));
        return thumbRelative.Replace(Path.GetExtension(thumbRelative), ".webp");
    }

    public Task DeleteFileAsync(string storedPath)
    {
        var fullPath = Path.Combine(_basePath, storedPath.Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(fullPath))
            File.Delete(fullPath);
        return Task.CompletedTask;
    }

    public string GetFileUrl(string storedPath)
    {
        return $"{_baseUrl}/uploads/{storedPath}";
    }

    public Stream? OpenRead(string storedPath)
    {
        var fullPath = Path.GetFullPath(Path.Combine(_basePath, storedPath.Replace('/', Path.DirectorySeparatorChar)));
        var root = Path.GetFullPath(_basePath);
        if (!fullPath.StartsWith(root, StringComparison.OrdinalIgnoreCase))
            return null;
        if (!File.Exists(fullPath)) return null;
        return File.OpenRead(fullPath);
    }
}
