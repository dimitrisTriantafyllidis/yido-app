namespace InvitationPlatform.Application.Auth.DTOs;

public record AuthResponse(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    string Locale,
    bool IsSystemAdmin,
    TenantInfo? CurrentTenant
);

public record TenantInfo(
    Guid TenantId,
    string Name,
    string Slug,
    string Role,
    bool IsOwner
);
