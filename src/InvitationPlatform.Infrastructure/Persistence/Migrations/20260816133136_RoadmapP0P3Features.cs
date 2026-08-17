using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InvitationPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RoadmapP0P3Features : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RelatedEntityId",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InviteToken",
                table: "Guests",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "InviteToken",
                table: "GuestGroups",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("""
                UPDATE Guests SET InviteToken = LOWER(REPLACE(CONVERT(nvarchar(36), NEWID()), '-', '')) WHERE InviteToken = '';
                UPDATE GuestGroups SET InviteToken = LOWER(REPLACE(CONVERT(nvarchar(36), NEWID()), '-', '')) WHERE InviteToken = '';
                """);

            migrationBuilder.CreateTable(
                name: "AddOnProducts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PriceAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PriceCurrency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StripePriceId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FeatureKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IntegerDelta = table.Column<int>(type: "int", nullable: false),
                    BooleanValue = table.Column<bool>(type: "bit", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AddOnProducts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EntityId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    Details = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RsvpQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Prompt = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    QuestionType = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    OptionsJson = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RsvpQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RsvpQuestions_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantFeatureOverrides",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FeatureKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BooleanValue = table.Column<bool>(type: "bit", nullable: true),
                    IntegerValue = table.Column<int>(type: "int", nullable: true),
                    StringValue = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    GrantedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantFeatureOverrides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantFeatureOverrides_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TenantFeatureOverrides_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RsvpAnswers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RsvpId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RsvpQuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RsvpAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RsvpAnswers_RsvpQuestions_RsvpQuestionId",
                        column: x => x.RsvpQuestionId,
                        principalTable: "RsvpQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RsvpAnswers_Rsvps_RsvpId",
                        column: x => x.RsvpId,
                        principalTable: "Rsvps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RelatedEntityId",
                table: "Orders",
                column: "RelatedEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_Guests_InviteToken",
                table: "Guests",
                column: "InviteToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GuestGroups_InviteToken",
                table: "GuestGroups",
                column: "InviteToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AddOnProducts_Key",
                table: "AddOnProducts",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_CreatedAt",
                table: "AuditLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_TenantId_Action",
                table: "AuditLogs",
                columns: new[] { "TenantId", "Action" });

            migrationBuilder.CreateIndex(
                name: "IX_RsvpAnswers_RsvpId_RsvpQuestionId",
                table: "RsvpAnswers",
                columns: new[] { "RsvpId", "RsvpQuestionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RsvpAnswers_RsvpQuestionId",
                table: "RsvpAnswers",
                column: "RsvpQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_RsvpQuestions_EventId",
                table: "RsvpQuestions",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_RsvpQuestions_TenantId_EventId",
                table: "RsvpQuestions",
                columns: new[] { "TenantId", "EventId" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantFeatureOverrides_EventId",
                table: "TenantFeatureOverrides",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantFeatureOverrides_TenantId_EventId_FeatureKey",
                table: "TenantFeatureOverrides",
                columns: new[] { "TenantId", "EventId", "FeatureKey" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AddOnProducts");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "RsvpAnswers");

            migrationBuilder.DropTable(
                name: "TenantFeatureOverrides");

            migrationBuilder.DropTable(
                name: "RsvpQuestions");

            migrationBuilder.DropIndex(
                name: "IX_Orders_RelatedEntityId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Guests_InviteToken",
                table: "Guests");

            migrationBuilder.DropIndex(
                name: "IX_GuestGroups_InviteToken",
                table: "GuestGroups");

            migrationBuilder.DropColumn(
                name: "RelatedEntityId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "InviteToken",
                table: "Guests");

            migrationBuilder.DropColumn(
                name: "InviteToken",
                table: "GuestGroups");
        }
    }
}
