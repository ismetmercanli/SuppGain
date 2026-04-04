using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SuppGain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationCoreModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NotificationReminders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplementTrackerId = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    NotifyAtTimeUtc = table.Column<TimeSpan>(type: "interval", nullable: false),
                    DaysOfWeekJson = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Channel = table.Column<int>(type: "integer", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastSentAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationReminders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificationReminders_SupplementTrackers_SupplementTrackerId",
                        column: x => x.SupplementTrackerId,
                        principalTable: "SupplementTrackers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_NotificationReminders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NotificationLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReminderId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduledAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SentAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ErrorMessage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificationLogs_NotificationReminders_ReminderId",
                        column: x => x.ReminderId,
                        principalTable: "NotificationReminders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NotificationLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationLogs_ReminderId",
                table: "NotificationLogs",
                column: "ReminderId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationLogs_SentAtUtc",
                table: "NotificationLogs",
                column: "SentAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationLogs_Status",
                table: "NotificationLogs",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationLogs_UserId",
                table: "NotificationLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationReminders_IsEnabled",
                table: "NotificationReminders",
                column: "IsEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationReminders_SupplementTrackerId",
                table: "NotificationReminders",
                column: "SupplementTrackerId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationReminders_UserId",
                table: "NotificationReminders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationReminders_UserId_NotifyAtTimeUtc",
                table: "NotificationReminders",
                columns: new[] { "UserId", "NotifyAtTimeUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotificationLogs");

            migrationBuilder.DropTable(
                name: "NotificationReminders");
        }
    }
}
