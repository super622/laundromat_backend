const db = require('../config/db');

// Find exist role
const findRoleByName = async (name) => {
  const [role] = await db.promise().query('SELECT * FROM roles WHERE role_name = ?', [name]);
  return role.length > 0 ? role[0] : null;
};

// Fetch all roles
const fetchAllRoles = (callback) => {
  const sql = ('SELECT * FROM roles');
  db.query(sql, callback);
};

// Create a new role
const createRole = async (name) => {
  await db.promise().query('INSERT INTO roles (role_name) VALUES (?)', [
    name
  ]);
  return true;
};

module.exports = { fetchAllRoles, createRole, findRoleByName };
