/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('questions', (table) => {
        table.increments('id').primary();
        table.string('question').notNullable();
        table.string('brand').notNullable();
        table.string('serial_number').notNullable();
        table.string('pounds').notNullable();
        table.string('year').notNullable();
        table.string('category').notNullable();
        table.string('file').notNullable();
        table.string('image').notNullable();
        table.string('tags').notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('questions');
};
