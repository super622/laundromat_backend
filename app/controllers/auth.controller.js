const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser, getLatestUserNumber } = require('../models/auth.model');

// SignUp function
const signUp = async (req, res) => {
  const { name, email, password, role, role_expertIn, role_businessTime, role_laundromatsCount } = req.body;

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
    const userId = await createUser(name, email, hashedPassword, role, level, role_expertIn, role_businessTime, role_laundromatsCount);

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


module.exports = { signUp, signIn };
