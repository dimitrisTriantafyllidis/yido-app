using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InvitationPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGuestPhotoUploads : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MediaFiles_EventId",
                table: "MediaFiles");

            migrationBuilder.AddColumn<string>(
                name: "GuestDisplayName",
                table: "MediaFiles",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsGuestUpload",
                table: "MediaFiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_MediaFiles_EventId_IsGuestUpload",
                table: "MediaFiles",
                columns: new[] { "EventId", "IsGuestUpload" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MediaFiles_EventId_IsGuestUpload",
                table: "MediaFiles");

            migrationBuilder.DropColumn(
                name: "GuestDisplayName",
                table: "MediaFiles");

            migrationBuilder.DropColumn(
                name: "IsGuestUpload",
                table: "MediaFiles");

            migrationBuilder.CreateIndex(
                name: "IX_MediaFiles_EventId",
                table: "MediaFiles",
                column: "EventId");
        }
    }
}
