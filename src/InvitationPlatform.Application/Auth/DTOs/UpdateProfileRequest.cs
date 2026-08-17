namespace InvitationPlatform.Application.Auth.DTOs;

public record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string Locale
);
