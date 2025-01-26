/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('payment_plans', (table) => {
        table.increments('id').primary();
        table.string('plan_name').notNullable();
        table.integer('plan_price').notNullable();
        table.integer('plan_discount').nullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('payment_plans');
};
