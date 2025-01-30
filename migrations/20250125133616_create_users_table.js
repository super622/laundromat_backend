/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('user_name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').nullable();
        table.string('level').nullable();
        // table.string('user_number').notNullable();
        table.integer('user_role').notNullable();
        table.string('user_role_expertIn').nullable();
        table.string('user_role_businessTime').nullable();
        table.string('user_role_laundromatsCount').nullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
