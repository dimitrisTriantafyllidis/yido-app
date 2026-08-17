using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InvitationPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTemplatesAndInvitations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Themes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DisplayFontFamily = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BodyFontFamily = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PrimaryColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    SecondaryColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    AccentColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    BackgroundColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    TextColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    SurfaceColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    BorderRadius = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "8px"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsPremium = table.Column<bool>(type: "bit", nullable: false),
                    PreviewImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Themes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InvitationTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    EventType = table.Column<byte>(type: "tinyint", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PreviewImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsPremium = table.Column<bool>(type: "bit", nullable: false),
                    MinPackageTier = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    DefaultThemeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvitationTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvitationTemplates_Themes_DefaultThemeId",
                        column: x => x.DefaultThemeId,
                        principalTable: "Themes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "InvitationVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ThemeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VersionNumber = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvitationVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvitationVersions_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvitationVersions_InvitationTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "InvitationTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvitationVersions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvitationVersions_Themes_ThemeId",
                        column: x => x.ThemeId,
                        principalTable: "Themes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "TemplateSectionDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SectionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DefaultSortOrder = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsEnabledByDefault = table.Column<bool>(type: "bit", nullable: false),
                    DefaultConfigJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MinPackageTier = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemplateSectionDefinitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TemplateSectionDefinitions_InvitationTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "InvitationTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InvitationSections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvitationVersionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SectionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    ConfigurationJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvitationSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvitationSections_InvitationVersions_InvitationVersionId",
                        column: x => x.InvitationVersionId,
                        principalTable: "InvitationVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InvitationSections_InvitationVersionId_SortOrder",
                table: "InvitationSections",
                columns: new[] { "InvitationVersionId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_InvitationSections_TenantId",
                table: "InvitationSections",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationTemplates_DefaultThemeId",
                table: "InvitationTemplates",
                column: "DefaultThemeId");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationTemplates_EventType",
                table: "InvitationTemplates",
                column: "EventType");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationTemplates_IsActive",
                table: "InvitationTemplates",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationVersions_EventId_VersionNumber",
                table: "InvitationVersions",
                columns: new[] { "EventId", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InvitationVersions_TemplateId",
                table: "InvitationVersions",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationVersions_TenantId",
                table: "InvitationVersions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationVersions_ThemeId",
                table: "InvitationVersions",
                column: "ThemeId");

            migrationBuilder.CreateIndex(
                name: "IX_TemplateSectionDefinitions_TemplateId_DefaultSortOrder",
                table: "TemplateSectionDefinitions",
                columns: new[] { "TemplateId", "DefaultSortOrder" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InvitationSections");

            migrationBuilder.DropTable(
                name: "TemplateSectionDefinitions");

            migrationBuilder.DropTable(
                name: "InvitationVersions");

            migrationBuilder.DropTable(
                name: "InvitationTemplates");

            migrationBuilder.DropTable(
                name: "Themes");
        }
    }
}
