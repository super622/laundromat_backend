/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('subscriptions', (table) => {
        table.increments('id').primary();
        table.integer('user_id').notNullable();
        table.integer('plan_id').notNullable();
        table.string('plan_type').notNullable();
        table.datetime('plan_start_date').notNullable();
        table.datetime('plan_end_date').notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('subscriptions');
};
