using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InvitationPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGuestInvitationTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "InvitationSentAt",
                table: "Guests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "InvitationSentVia",
                table: "Guests",
                type: "tinyint",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InvitationSentAt",
                table: "Guests");

            migrationBuilder.DropColumn(
                name: "InvitationSentVia",
                table: "Guests");
        }
    }
}
