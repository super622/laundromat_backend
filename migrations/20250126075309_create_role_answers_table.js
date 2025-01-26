/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('role_answers', (table) => {
        table.increments('id').primary();
        table.integer('user_id').notNullable();
        table.integer('question_id').notNullable();
        table.string('role_answer').notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('role_answers');
};
