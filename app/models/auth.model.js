const db = require('../config/db');

const updateUserVerifyCode = async (id, verifyCode, phoneNumber) => {
  const verifyPhoneTime = Math.floor(Date.now() / 1000) + 600;
  const [result] = await db.promise().query(
    'UPDATE users SET user_verifycode = ?, user_phonenumber = ?, user_verifyTime = ? WHERE id = ?',
    [verifyCode, phoneNumber, verifyPhoneTime, id]
  );
};

// Find user by email
const findUserByEmail = async (email) => {
  const [user] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
  return user.length > 0 ? user[0] : null;
};

// Create a new user and return the inserted user ID
const createUser = async (name, email, password, role, level, role_expertIn, role_businessTime, role_laundromatsCount, address, phoneNumber) => {
  const [result] = await db.promise().query(
    'INSERT INTO users (user_name, email, password, user_role, level, user_role_expertIn, user_role_businessTime, user_role_laundromatsCount, user_address, user_phonenumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, email, password, role, level, role_expertIn, role_businessTime, role_laundromatsCount, address, phoneNumber]
  );
  return result.insertId; // Return the ID of the newly inserted user
};

const updateUser = async (userId, name, email, password, role, role_expertIn, role_businessTime, role_laundromatsCount, user_image, address, phoneNumber) => {
  try {
    // Check if user exists
    const [user] = await db.promise().query('SELECT * FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return false;
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('user_name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password !== undefined && password !== null && password !== "") {
      updates.push('password = ?');
      values.push(password);
    }
    if (role !== undefined) {
      updates.push('user_role = ?');
      values.push(role);
    }
    if (role_expertIn !== undefined) {
      updates.push('user_role_expertIn = ?');
      values.push(role_expertIn);
    }
    if (role_businessTime !== undefined) {
      updates.push('user_role_businessTime = ?');
      values.push(role_businessTime);
    }
    if (role_laundromatsCount !== undefined) {
      updates.push('user_role_laundromatsCount = ?');
      values.push(role_laundromatsCount);
    }
    if (user_image !== undefined) {
      updates.push('user_image = ?');
      values.push(user_image);
    }

    if (address !== undefined) {
      updates.push('user_address = ?');
      values.push(address);
    }

    if (phoneNumber !== undefined) {
      updates.push('user_phonenumber = ?');
      values.push(phoneNumber);
    }

    if (updates.length === 0) {
      return { success: false, message: 'No updates provided' };
    }

    values.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await db.promise().query(query, values);

    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, message: 'Internal server error' };
  }
};

module.exports = { updateUserVerifyCode, createUser, findUserByEmail, updateUser };
