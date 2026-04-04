using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SuppGain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSupplementInfoModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SupplementInfos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Summary = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Content = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    Benefits = table.Column<string>(type: "character varying(3000)", maxLength: 3000, nullable: false),
                    UsageInstructions = table.Column<string>(type: "character varying(3000)", maxLength: 3000, nullable: false),
                    Warnings = table.Column<string>(type: "character varying(3000)", maxLength: 3000, nullable: false),
                    SideEffects = table.Column<string>(type: "character varying(3000)", maxLength: 3000, nullable: false),
                    TargetAudience = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    References = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplementInfos", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SupplementInfos_IsPublished",
                table: "SupplementInfos",
                column: "IsPublished");

            migrationBuilder.CreateIndex(
                name: "IX_SupplementInfos_TargetAudience",
                table: "SupplementInfos",
                column: "TargetAudience");

            migrationBuilder.CreateIndex(
                name: "IX_SupplementInfos_Title",
                table: "SupplementInfos",
                column: "Title",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SupplementInfos");
        }
    }
}
