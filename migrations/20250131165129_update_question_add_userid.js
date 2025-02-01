/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table("questions", table => {
      table.integer('user_id').notNullable();
    })
  };
  
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.table("questions", table => {
        table.dropColumn('user_id');
      })
  };
  