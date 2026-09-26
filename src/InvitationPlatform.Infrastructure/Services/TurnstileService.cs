using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace InvitationPlatform.Infrastructure.Services;

public interface ITurnstileService
{
    Task<(bool Success, string? ErrorCode)> VerifyAsync(string token, string? remoteIp, CancellationToken ct = default);
    bool IsEnabled { get; }
}

public class TurnstileService : ITurnstileService
{
    private readonly HttpClient _httpClient;
    private readonly string? _secretKey;
    private readonly ILogger<TurnstileService> _logger;
    private const string VerifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    public TurnstileService(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<TurnstileService> logger)
    {
        _httpClient = httpClientFactory.CreateClient("Turnstile");
        _secretKey = configuration["Captcha:Turnstile:SecretKey"];
        _logger = logger;
    }

    public bool IsEnabled => !string.IsNullOrWhiteSpace(_secretKey);

    public async Task<(bool Success, string? ErrorCode)> VerifyAsync(string token, string? remoteIp, CancellationToken ct = default)
    {
        if (!IsEnabled)
        {
            _logger.LogDebug("Turnstile is not configured, skipping verification");
            return (true, null);
        }

        if (string.IsNullOrWhiteSpace(token))
        {
            return (false, "missing-input-response");
        }

        try
        {
            var formData = new Dictionary<string, string>
            {
                ["secret"] = _secretKey!,
                ["response"] = token
            };

            if (!string.IsNullOrWhiteSpace(remoteIp))
            {
                formData["remoteip"] = remoteIp;
            }

            var response = await _httpClient.PostAsync(
                VerifyUrl,
                new FormUrlEncodedContent(formData),
                ct);

            var result = await response.Content.ReadFromJsonAsync<TurnstileResponse>(ct);

            if (result?.Success == true)
            {
                _logger.LogDebug("Turnstile verification successful");
                return (true, null);
            }

            var errorCode = result?.ErrorCodes?.FirstOrDefault() ?? "unknown-error";
            _logger.LogWarning("Turnstile verification failed: {ErrorCode}", errorCode);
            return (false, errorCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Turnstile verification error");
            return (false, "verification-error");
        }
    }

    private class TurnstileResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("challenge_ts")]
        public string? ChallengeTs { get; set; }

        [JsonPropertyName("hostname")]
        public string? Hostname { get; set; }

        [JsonPropertyName("error-codes")]
        public List<string>? ErrorCodes { get; set; }
    }
}

/// <summary>No-op Turnstile service for development without CAPTCHA.</summary>
public class NoOpTurnstileService : ITurnstileService
{
    public bool IsEnabled => false;
    public Task<(bool Success, string? ErrorCode)> VerifyAsync(string token, string? remoteIp, CancellationToken ct = default)
        => Task.FromResult<(bool, string?)>((true, null));
}
