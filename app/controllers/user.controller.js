const { getAllUsers, fetchUserDataById, checkUserEmailExists, deleteUserById, updateUserToken  } = require('../models/user.model');
const { sendNotification, sendNotificationToMultipleUsers } = require('../utils/FirebaseService');

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

const saveFCMToken = async (req, res) => {
  try {
    const { email, token } = req.body; // Get email from request body

    if (!email || !token) {
      return res.status(400).json({ message: "Email and Token is required" });
    }

    const userId = await checkUserEmailExists(email);

    if (userId) {
      await updateUserToken(email, token);
      return res.status(200).json({ message: "Token Updated!" });
    } else {
      return res.status(404).json({ message: "User does not exist" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const sendNotifications = async (req, res) => {
  await sendNotification("e0DZW6FZw0n4mV35sEIXXl:APA91bGowvco0D--WLT3mGH8-tqV1ptXLzrcIEujiFfwHLKCR5ZkK5mMDjbG5gb-aGJtmXKVhNuzSXp-pfoZCVdsWxt8_6FkYPf2NxiUftNKckNB_m9CBo8", "New Notification", "This is test notification");
  // await sendNotificationToMultipleUsers([""], "Multi Notification", "This is multi notification");
  return res.status(200).json({ message: "Sent!" });
};

module.exports = { fetchUsers, getUserDataById, checkGoogleUser, deleteUserAccount, saveFCMToken, sendNotifications };
