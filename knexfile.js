const dotenv = require("dotenv");

dotenv.config();
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    },
    migrations: {
      tableName: 'knex_migrations', // Default table to track migrations
      directory: './migrations',    // Directory to store migration files
    },
    seeds: {
      directory: './seeds',         // Directory to store seed files
    },
  },

  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    },
    migrations: {
      tableName: 'knex_migrations', // Default table to track migrations
      directory: './migrations',    // Directory to store migration files
    },
    seeds: {
      directory: './seeds',         // Directory to store seed files
    },
  }

};
