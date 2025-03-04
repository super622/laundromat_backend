const { getAllUsers, fetchUserDataById, checkUserEmailExists, deleteUserById, updateUserToken, trackUserLogin  } = require('../models/user.model');
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

    // Fetch user data
    const user = await fetchUserDataById(user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Track user login
    await trackUserLogin(user_id);

    // Fetch updated login count after tracking
    const updatedUser = await fetchUserDataById(user_id);

    res.status(200).json({
      message: 'User data fetched successfully',
      user: updatedUser,
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
    const { userId, token } = req.body; // Get userId from request body

    if (!userId || !token) {
      return res.status(400).json({ message: "userId and Token is required" });
    }

    const user = await fetchUserDataById(userId);

    if (user) {
      await updateUserToken(userId, token);
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
  await sendNotification("cjg6-9rA50Knr7F_Mnjvf7:APA91bFGUYlM0xj7CQ6-MdJznrwaEgEYWtvua6hBr1dVdcuOicVoceyJnHqd--RndvBWArX2CGw6yNWYLW4u6zz9QNa57b3yOPF8eT6Zb-wIGXbMr4Ewygw", "New Notification", "This is test notification");
  // await sendNotificationToMultipleUsers([""], "Multi Notification", "This is multi notification");
  return res.status(200).json({ message: "Sent!" });
};

module.exports = { fetchUsers, getUserDataById, checkGoogleUser, deleteUserAccount, saveFCMToken, sendNotifications };
