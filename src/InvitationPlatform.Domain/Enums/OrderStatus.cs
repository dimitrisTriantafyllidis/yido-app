namespace InvitationPlatform.Domain.Enums;

public enum OrderStatus : byte
{
    Pending = 1,
    Paid = 2,
    Refunded = 3,
    Failed = 4
}
