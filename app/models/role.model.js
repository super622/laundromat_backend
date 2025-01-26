const db = require('../config/db');

// Find exist role
const findRoleByName = async (name) => {
  const [role] = await db.promise().query('SELECT * FROM roles WHERE role_name = ?', [name]);
  return role.length > 0 ? role[0] : null;
};

const findRoleById = async (id) => {
  const [role] = await db.promise().query('SELECT * FROM roles WHERE id = ?', [id]);
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

// --------------------------------- //

// Fatch all role question
const fetchAllRolesQuestions = (id, callback) => {
  const sql = 'SELECT * FROM role_questions WHERE role_id = ?';
  db.query(sql, [id], callback);
};

// Create a new role question
const createRoleQuestion = async (id, question) => {
  await db.promise().query('INSERT INTO role_questions (role_id, role_question) VALUES (?, ?)', [
    id,
    question
  ]);
  return true;
};

module.exports = { fetchAllRoles, createRole, findRoleByName, fetchAllRolesQuestions, createRoleQuestion, findRoleById };
