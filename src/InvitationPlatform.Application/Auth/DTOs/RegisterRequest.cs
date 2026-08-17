namespace InvitationPlatform.Application.Auth.DTOs;

public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? OrganizationName,
    string Locale = "el"
);
