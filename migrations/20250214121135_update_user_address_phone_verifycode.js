/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table("users", table => {
      table.string('user_address').nullable();
      table.string('user_phonenumber').nullable();
      table.string('user_verifycode').nullable();
    })
  };
  
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.table("users", table => {
        table.dropColumn('user_address');
        table.dropColumn('user_phonenumber');
        table.dropColumn('user_verifycode');
      })
  };
  