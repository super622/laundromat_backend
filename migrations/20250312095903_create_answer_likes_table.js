/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('answer_likes', (table) => {
        table.increments('id').primary();
        table.integer('answer_id').notNullable();
        table.integer('user_id').nullable();
        table.integer('type').nullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('answer_likes');
};
