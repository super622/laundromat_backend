const { getAllUsers, fetchUserDataById, checkUserEmailExists, deleteUserById  } = require('../models/user.model');

// Get all users
const fetchUsers = (req, res) => {
  getAllUsers((err, results) => {
    if (err) {
      console.error('Error fetching users:', err.message);
      return res.status(500).send('Database query error');
    }
    res.json(results);
  });
};


const getUserDataById = async (req, res) => {
  try {
    const { user_id } = req.params; // Get user_id from request parameters

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await fetchUserDataById(user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User data fetched successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

const checkGoogleUser = async (req, res) => {
  try {
    const { email } = req.body; // Get email from request body

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userId = await checkUserEmailExists(email);

    if (userId) {
      return res.status(200).json({
        message: "User found",
        user_id: userId
      });
    }

    return res.status(404).json({ message: "User does not exist" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

// Delete user account via POST request
const deleteUserAccount = async (req, res) => {
  try {
    const { user_id } = req.body; // Get user_id from request body

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await fetchUserDataById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const deleted = await deleteUserById(user_id);
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete user account' });
    }

    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};


module.exports = { fetchUsers, getUserDataById, checkGoogleUser, deleteUserAccount };
