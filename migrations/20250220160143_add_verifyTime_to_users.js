/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table("users", table => {
        table.string('user_verifyTime').nullable();
    })
};
  
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.table("users", table => {
        table.dropColumn('user_verifyTime');
    })
};
