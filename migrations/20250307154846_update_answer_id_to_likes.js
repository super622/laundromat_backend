/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable("likes_and_dislikes", function (table) {
        table.integer("answer_id");
    });
};
  
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable("likes_and_dislikes", function (table) {  
        table.dropColumn("question_id");
    });
};
  