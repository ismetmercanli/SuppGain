using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SuppGain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAthletePackageModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AthletePackages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    AthleteType = table.Column<int>(type: "integer", nullable: false),
                    DiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AthletePackages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AthletePackageItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AthletePackageId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AthletePackageItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AthletePackageItems_AthletePackages_AthletePackageId",
                        column: x => x.AthletePackageId,
                        principalTable: "AthletePackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AthletePackageItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AthletePackageItems_AthletePackageId",
                table: "AthletePackageItems",
                column: "AthletePackageId");

            migrationBuilder.CreateIndex(
                name: "IX_AthletePackageItems_AthletePackageId_ProductId",
                table: "AthletePackageItems",
                columns: new[] { "AthletePackageId", "ProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AthletePackageItems_ProductId",
                table: "AthletePackageItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_AthletePackages_AthleteType",
                table: "AthletePackages",
                column: "AthleteType");

            migrationBuilder.CreateIndex(
                name: "IX_AthletePackages_IsActive",
                table: "AthletePackages",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_AthletePackages_Name_AthleteType",
                table: "AthletePackages",
                columns: new[] { "Name", "AthleteType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AthletePackageItems");

            migrationBuilder.DropTable(
                name: "AthletePackages");
        }
    }
}
