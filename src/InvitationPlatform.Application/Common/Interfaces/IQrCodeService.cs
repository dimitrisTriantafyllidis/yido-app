namespace InvitationPlatform.Application.Common.Interfaces;

public interface IQrCodeService
{
    byte[] GeneratePng(string content, int pixelsPerModule = 4);
}
