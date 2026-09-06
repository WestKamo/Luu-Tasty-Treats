using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LuuTastyTreats.Api.Shared.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrdersAndAddressesSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "orders");

            migrationBuilder.CreateTable(
                name: "addresses",
                schema: "identity",
                columns: table => new
                {
                    address_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    label = table.Column<string>(type: "text", nullable: true),
                    line1 = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    line2 = table.Column<string>(type: "text", nullable: true),
                    city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    province_state = table.Column<string>(type: "text", nullable: true),
                    postal_code = table.Column<string>(type: "text", nullable: true),
                    country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    is_default = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_addresses", x => x.address_id);
                    table.ForeignKey(
                        name: "fk_addresses_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "identity",
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                schema: "orders",
                columns: table => new
                {
                    order_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    order_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    delivery_method = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    delivery_address_id = table.Column<Guid>(type: "uuid", nullable: true),
                    requested_date = table.Column<DateOnly>(type: "date", nullable: false),
                    subtotal = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    delivery_fee = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    tax_amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    idempotency_key = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_orders", x => x.order_id);
                });

            migrationBuilder.CreateTable(
                name: "order_items",
                schema: "orders",
                columns: table => new
                {
                    order_item_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cake_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cake_name_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    custom_text = table.Column<string>(type: "text", nullable: true),
                    unit_price = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    line_total = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    selected_customizations_json = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_order_items", x => x.order_item_id);
                    table.ForeignKey(
                        name: "fk_order_items_orders_order_id",
                        column: x => x.order_id,
                        principalSchema: "orders",
                        principalTable: "orders",
                        principalColumn: "order_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "order_status_history",
                schema: "orders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    changed_by = table.Column<Guid>(type: "uuid", nullable: true),
                    note = table.Column<string>(type: "text", nullable: true),
                    changed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_order_status_history", x => x.id);
                    table.ForeignKey(
                        name: "fk_order_status_history_orders_order_id",
                        column: x => x.order_id,
                        principalSchema: "orders",
                        principalTable: "orders",
                        principalColumn: "order_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "order_item_customization_selections",
                schema: "orders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    order_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    option_id = table.Column<Guid>(type: "uuid", nullable: true),
                    option_label_snapshot = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    group_name_snapshot = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    price_modifier = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_order_item_customization_selections", x => x.id);
                    table.ForeignKey(
                        name: "fk_order_item_customization_selections_order_items_order_item_",
                        column: x => x.order_item_id,
                        principalSchema: "orders",
                        principalTable: "order_items",
                        principalColumn: "order_item_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_addresses_user_id",
                schema: "identity",
                table: "addresses",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_order_item_customization_selections_order_item_id",
                schema: "orders",
                table: "order_item_customization_selections",
                column: "order_item_id");

            migrationBuilder.CreateIndex(
                name: "idx_order_items_order",
                schema: "orders",
                table: "order_items",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "ix_order_status_history_order_id",
                schema: "orders",
                table: "order_status_history",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "idx_orders_requested_date",
                schema: "orders",
                table: "orders",
                column: "requested_date");

            migrationBuilder.CreateIndex(
                name: "idx_orders_status",
                schema: "orders",
                table: "orders",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "idx_orders_user",
                schema: "orders",
                table: "orders",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_orders_idempotency_key",
                schema: "orders",
                table: "orders",
                column: "idempotency_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_orders_order_number",
                schema: "orders",
                table: "orders",
                column: "order_number",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "addresses",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "order_item_customization_selections",
                schema: "orders");

            migrationBuilder.DropTable(
                name: "order_status_history",
                schema: "orders");

            migrationBuilder.DropTable(
                name: "order_items",
                schema: "orders");

            migrationBuilder.DropTable(
                name: "orders",
                schema: "orders");
        }
    }
}
