using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InvitationPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEventTablesSeating : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "EventTableId",
                table: "Guests",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SeatIndex",
                table: "Guests",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EventTables",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CategoryLabel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventTables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventTables_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Guests_EventTableId",
                table: "Guests",
                column: "EventTableId");

            migrationBuilder.CreateIndex(
                name: "IX_EventTables_EventId_SortOrder",
                table: "EventTables",
                columns: new[] { "EventId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_EventTables_TenantId_EventId",
                table: "EventTables",
                columns: new[] { "TenantId", "EventId" });

            migrationBuilder.AddForeignKey(
                name: "FK_Guests_EventTables_EventTableId",
                table: "Guests",
                column: "EventTableId",
                principalTable: "EventTables",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Guests_EventTables_EventTableId",
                table: "Guests");

            migrationBuilder.DropTable(
                name: "EventTables");

            migrationBuilder.DropIndex(
                name: "IX_Guests_EventTableId",
                table: "Guests");

            migrationBuilder.DropColumn(
                name: "EventTableId",
                table: "Guests");

            migrationBuilder.DropColumn(
                name: "SeatIndex",
                table: "Guests");
        }
    }
}
