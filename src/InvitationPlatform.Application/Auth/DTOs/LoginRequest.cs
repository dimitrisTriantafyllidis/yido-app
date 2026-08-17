namespace InvitationPlatform.Application.Auth.DTOs;

public record LoginRequest(string Email, string Password, bool RememberMe = false, string? MfaCode = null);
