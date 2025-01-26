const db = require('../config/db');

// Find exist tag
const findTagByName = async (name) => {
  const [role] = await db.promise().query('SELECT * FROM tags WHERE tag_name = ?', [name]);
  return role.length > 0 ? role[0] : null;
};

// Fetch all tags
const fetchAllTags = (callback) => {
  const sql = ('SELECT * FROM tags');
  db.query(sql, callback);
};

// Create a new role
const createTag = async (name) => {
  await db.promise().query('INSERT INTO tags (tag_name) VALUES (?)', [
    name
  ]);
  return true;
};

module.exports = { fetchAllTags, createTag, findTagByName };
