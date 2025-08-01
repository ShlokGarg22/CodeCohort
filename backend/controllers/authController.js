const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { signupSchema, signinSchema, updateProfileSchema } = require('../validators/authValidation');
const { z } = require('zod');

// Signup controller
const signup = async (req, res) => {
  try {
    // Validate input
    const validatedData = signupSchema.parse(req.body);
    const { username, email, password, fullName, role = 'user' } = validatedData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      fullName,
      role
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Send different messages based on role
    let message = 'User created successfully';
    if (role === 'creator') {
      message = 'Creator account created successfully. Your account is pending admin approval.';
    }

    res.status(201).json({
      success: true,
      message,
      data: {
        user,
        token
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Signin controller
const signin = async (req, res) => {
  try {
    // Validate input
    const validatedData = signinSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from user object
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Signin successful',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    // Validate input
    const validatedData = updateProfileSchema.parse(req.body);

    // Check if username is being updated and if it's already taken
    if (validatedData.username && validatedData.username !== req.user.username) {
      const existingUser = await User.findOne({ username: validatedData.username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      validatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout (client-side handles token removal)
const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get pending creator requests
const getPendingCreators = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const pendingCreators = await User.find({
      role: 'creator',
      creatorStatus: 'pending'
    }).select('-password');

    res.status(200).json({
      success: true,
      data: {
        pendingCreators
      }
    });

  } catch (error) {
    console.error('Get pending creators error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Approve or reject creator request
const updateCreatorStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { userId, status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected".'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'creator') {
      return res.status(400).json({
        success: false,
        message: 'User is not a creator'
      });
    }

    user.creatorStatus = status;
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: `Creator request ${status} successfully`,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update creator status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const users = await User.find({}).select('-password').populate('approvedBy', 'username fullName');

    res.status(200).json({
      success: true,
      data: {
        users
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  signup,
  signin,
  getProfile,
  updateProfile,
  logout,
  getPendingCreators,
  updateCreatorStatus,
  getAllUsers
};
