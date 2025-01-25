/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('likes_and_dislikes', (table) => {
        table.increments('id').primary();
        table.integer('question_id').notNullable();
        table.integer('user_id').notNullable();
        table.integer('type').notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('likes_and_dislikes');
};
