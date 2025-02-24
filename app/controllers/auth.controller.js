const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser, updateUser, updateUserVerifyCode } = require('../models/auth.model');
const phoneSms = require('../utils/SMSService');
const { fetchUserDataById } = require('../models/user.model');

const generateVerificationCode = (length = 6) => {
  let code = "";
  for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10);
  }
  return code;
}

const verifyCode = async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ message: 'Code and User Id is required' });
    }

    const existingUser = await fetchUserDataById(userId);
    if (!existingUser) {
      res.status(404).json({ message: "User Not Found! Please Register First." });
    }

    const verifyTime = Math.floor(Date.now() / 1000);

    if (verifyTime > parseInt(existingUser.user_verifyTime)) {
      res.status(401).json({message: "This verifyCode is expired. Please regenerate code!"})
    } else {
      if (existingUser.user_verifycode == code) {
        res.status(200).json({message: "Success to verify code."});
      } else {
        res.status(401).json({message: "Invalid verification code."});
      }
    }
  } catch (e) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

const requestVerifyCode = async (req, res) => {
  try {
    const { phone, userId } = req.body;
    if (!phone || !userId) {
      return res.status(400).json({ message: 'Phone number and User Id is required' });
    }

    const phoneNumber = await phoneSms.checkPhoneNumber(phone);
    if (!phoneNumber) {
      return res.status(400).json({ message: "Invalid Phone Number" });
    }

    const existingUser = await fetchUserDataById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User Not Found! Please Register First." });
    }

    const verifyCode = generateVerificationCode();

    await updateUserVerifyCode(userId, verifyCode, phoneNumber);

    const verifiedContent = `Your verification code is here: \n ${verifyCode}`;
    await phoneSms.pushNotification(verifiedContent, phoneNumber);

    res.status(200).json({
      message: 'Verifycation code sent!',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// SignUp function
const signUp = async (req, res) => {
  const { name, email, password, role, role_expertIn, role_businessTime, role_laundromatsCount, addresss, phoneNumber } = req.body;

  try {
    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const level = '1';

    // Create the user and get the new user ID
    const userId = await createUser(name, email, hashedPassword, role, level, role_expertIn, role_businessTime, role_laundromatsCount, addresss, phoneNumber);

    res.status(201).json({
      message: 'User registered successfully',
      userId, // Include the new user ID in the response
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// SignIn function
const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.user_role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return user details along with the token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.user_name,
        email: user.email,
        role: user.user_role,
        level: user.level,
        role_expertIn: user.user_role_expertIn,
        role_businessTime: user.user_role_businessTime,
        role_laundromatsCount: user.user_role_laundromatsCount,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Update User function (POST request)
const updateUserProfile = async (req, res) => {
  const { userId, name, email, password, role, role_expertIn, role_businessTime, role_laundromatsCount, user_image, address, phonenumber } = req.body;

  try {
    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update user details
    const updated = await updateUser(userId, name, email, hashedPassword, role, role_expertIn, role_businessTime, role_laundromatsCount, user_image, address, phonenumber);

    if (updated) {
      res.status(200).json({ message: 'User profile updated successfully' });
    } else {
      res.status(400).json({ message: 'Failed to update user profile' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { verifyCode, signUp, signIn, updateUserProfile, requestVerifyCode };
