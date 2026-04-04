using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SuppGain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCartConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId",
                table: "CartItems");

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitPrice",
                table: "CartItems",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.CreateIndex(
                name: "IX_Carts_IsCheckedOut",
                table: "Carts",
                column: "IsCheckedOut");

            migrationBuilder.CreateIndex(
                name: "IX_Carts_UserId_IsCheckedOut",
                table: "Carts",
                columns: new[] { "UserId", "IsCheckedOut" },
                unique: true,
                filter: "\"IsCheckedOut\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId_ProductId",
                table: "CartItems",
                columns: new[] { "CartId", "ProductId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Carts_IsCheckedOut",
                table: "Carts");

            migrationBuilder.DropIndex(
                name: "IX_Carts_UserId_IsCheckedOut",
                table: "Carts");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId_ProductId",
                table: "CartItems");

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitPrice",
                table: "CartItems",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId",
                table: "CartItems",
                column: "CartId");
        }
    }
}
