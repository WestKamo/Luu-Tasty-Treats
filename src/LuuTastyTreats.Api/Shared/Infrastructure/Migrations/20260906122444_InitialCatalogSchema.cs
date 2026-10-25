using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LuuTastyTreats.Api.Shared.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCatalogSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "catalog");

            migrationBuilder.CreateTable(
                name: "categories",
                schema: "catalog",
                columns: table => new
                {
                    category_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_categories", x => x.category_id);
                });

            migrationBuilder.CreateTable(
                name: "customization_groups",
                schema: "catalog",
                columns: table => new
                {
                    group_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    selection_type = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    is_global = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_customization_groups", x => x.group_id);
                });

            migrationBuilder.CreateTable(
                name: "cakes",
                schema: "catalog",
                columns: table => new
                {
                    cake_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    category_id = table.Column<Guid>(type: "uuid", nullable: true),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    base_price = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    base_image_url = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    is_featured = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cakes", x => x.cake_id);
                    table.CheckConstraint("ck_cakes_base_price_nonnegative", "\"base_price\" >= 0");
                    table.ForeignKey(
                        name: "fk_cakes_categories_category_id",
                        column: x => x.category_id,
                        principalSchema: "catalog",
                        principalTable: "categories",
                        principalColumn: "category_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "customization_options",
                schema: "catalog",
                columns: table => new
                {
                    option_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    group_id = table.Column<Guid>(type: "uuid", nullable: false),
                    label = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    price_modifier = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    image_override_url = table.Column<string>(type: "text", nullable: true),
                    is_available = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_customization_options", x => x.option_id);
                    table.ForeignKey(
                        name: "fk_customization_options_customization_groups_group_id",
                        column: x => x.group_id,
                        principalSchema: "catalog",
                        principalTable: "customization_groups",
                        principalColumn: "group_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "cake_customization_groups",
                schema: "catalog",
                columns: table => new
                {
                    cake_id = table.Column<Guid>(type: "uuid", nullable: false),
                    group_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_required = table.Column<bool>(type: "boolean", nullable: false),
                    min_selections = table.Column<int>(type: "integer", nullable: false),
                    max_selections = table.Column<int>(type: "integer", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cake_customization_groups", x => new { x.cake_id, x.group_id });
                    table.ForeignKey(
                        name: "fk_cake_customization_groups_cakes_cake_id",
                        column: x => x.cake_id,
                        principalSchema: "catalog",
                        principalTable: "cakes",
                        principalColumn: "cake_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_cake_customization_groups_customization_groups_group_id",
                        column: x => x.group_id,
                        principalSchema: "catalog",
                        principalTable: "customization_groups",
                        principalColumn: "group_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "cake_images",
                schema: "catalog",
                columns: table => new
                {
                    image_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    cake_id = table.Column<Guid>(type: "uuid", nullable: false),
                    image_url = table.Column<string>(type: "text", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cake_images", x => x.image_id);
                    table.ForeignKey(
                        name: "fk_cake_images_cakes_cake_id",
                        column: x => x.cake_id,
                        principalSchema: "catalog",
                        principalTable: "cakes",
                        principalColumn: "cake_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "cake_text_fields",
                schema: "catalog",
                columns: table => new
                {
                    field_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    cake_id = table.Column<Guid>(type: "uuid", nullable: false),
                    label = table.Column<string>(type: "text", nullable: false),
                    max_length = table.Column<int>(type: "integer", nullable: false),
                    is_required = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cake_text_fields", x => x.field_id);
                    table.ForeignKey(
                        name: "fk_cake_text_fields_cakes_cake_id",
                        column: x => x.cake_id,
                        principalSchema: "catalog",
                        principalTable: "cakes",
                        principalColumn: "cake_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_cake_customization_groups_group_id",
                schema: "catalog",
                table: "cake_customization_groups",
                column: "group_id");

            migrationBuilder.CreateIndex(
                name: "ix_cake_images_cake_id",
                schema: "catalog",
                table: "cake_images",
                column: "cake_id");

            migrationBuilder.CreateIndex(
                name: "ix_cake_text_fields_cake_id",
                schema: "catalog",
                table: "cake_text_fields",
                column: "cake_id");

            migrationBuilder.CreateIndex(
                name: "idx_cakes_category",
                schema: "catalog",
                table: "cakes",
                column: "category_id",
                filter: "\"is_active\" = true");

            migrationBuilder.CreateIndex(
                name: "idx_options_group",
                schema: "catalog",
                table: "customization_options",
                column: "group_id",
                filter: "\"is_available\" = true");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cake_customization_groups",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "cake_images",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "cake_text_fields",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "customization_options",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "cakes",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "customization_groups",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "categories",
                schema: "catalog");
        }
    }
}
