namespace InvitationPlatform.Application.Auth.DTOs;

public record ResetPasswordRequest(
    string Email,
    string Token,
    string NewPassword
);
