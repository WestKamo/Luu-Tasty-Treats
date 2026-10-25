using LuuTastyTreats.Api.Shared.Infrastructure;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable
namespace LuuTastyTreats.Api.Shared.Infrastructure.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261025090000_AddFirebaseUid")]
public sealed class AddFirebaseUid : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(name: "firebase_uid", schema: "identity", table: "users",
            type: "character varying(128)", maxLength: 128, nullable: true);
        migrationBuilder.CreateIndex(name: "ix_users_firebase_uid", schema: "identity", table: "users",
            column: "firebase_uid", unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "ix_users_firebase_uid", schema: "identity", table: "users");
        migrationBuilder.DropColumn(name: "firebase_uid", schema: "identity", table: "users");
    }
}
