const mysql = require('mysql2');
const dotenv = require("dotenv");

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,       // From .env file
  user: process.env.DB_USER,       // From .env file
  password: process.env.DB_PASS,   // From .env file
  database: process.env.DB_NAME,   // From .env file
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

module.exports = db;
