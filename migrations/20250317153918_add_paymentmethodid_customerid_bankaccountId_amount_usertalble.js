/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable("users", function (table) {
        table.string("paymentMethodId").nullable();
        table.string("bankAccountId").nullable();
        table.string("customerId").nullable();
        table.double("amount").nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable("users", function (table) {
        table.dropColumn("paymentMethodId");
        table.dropColumn("bankAccountId");
        table.dropColumn("customerId");
        table.dropColumn("amount");
    });
};
