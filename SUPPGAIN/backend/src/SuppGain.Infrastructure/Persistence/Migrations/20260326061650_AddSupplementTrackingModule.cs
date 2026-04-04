using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SuppGain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSupplementTrackingModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SupplementTrackers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    DailyDosage = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    TimesPerDay = table.Column<int>(type: "integer", nullable: false),
                    TimesOfDayJson = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    CurrentStock = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    LowStockThreshold = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    StartDateUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDateUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    LastConsumedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplementTrackers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplementTrackers_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SupplementTrackers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupplementConsumptionLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TrackerId = table.Column<Guid>(type: "uuid", nullable: false),
                    ConsumedAmount = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    ConsumedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Note = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplementConsumptionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplementConsumptionLogs_SupplementTrackers_TrackerId",
                        column: x => x.TrackerId,
                        principalTable: "SupplementTrackers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SupplementConsumptionLogs_ConsumedAtUtc",
                table: "SupplementConsumptionLogs",
                column: "ConsumedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_SupplementConsumptionLogs_TrackerId",
                table: "SupplementConsumptionLogs",
                column: "TrackerId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplementTrackers_IsActive",
                table: "SupplementTrackers",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_SupplementTrackers_ProductId",
                table: "SupplementTrackers",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplementTrackers_UserId",
                table: "SupplementTrackers",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SupplementConsumptionLogs");

            migrationBuilder.DropTable(
                name: "SupplementTrackers");
        }
    }
}
