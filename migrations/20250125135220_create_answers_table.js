/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('answers', (table) => {
        table.increments('id').primary();
        table.integer('question_id').notNullable();
        table.string('answer').notNullable();
        table.string('isWho').notNullable();
        table.integer('user_id').notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('answers');
};
