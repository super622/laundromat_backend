/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('payment', (table) => {
        table.increments('id').primary();
        table.integer('user_id').notNullable();
        table.string('payment_id').notNullable()
        table.double('amount').nullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('payment');
};
