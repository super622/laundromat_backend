/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('transaction', (table) => {
        table.increments('id').primary();
        table.integer('sender_id').notNullable();
        table.integer('receiver_id').notNullable()
        table.double('amount').notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('transaction');
};
