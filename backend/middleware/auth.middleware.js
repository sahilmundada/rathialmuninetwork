const jwt = require('jsonwebtoken');
const { clerkClient } = require('@clerk/clerk-sdk-node');
const User = require('../models/user.model');

// Middleware to authenticate with Clerk or JWT (backward compatibility)
const requireAuth = async (req, res, next) => {
  try {
    let token;
    let user;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, no token provided' 
      });
    }

    try {
      // First try to verify as Clerk JWT
      const clerkUser = await clerkClient.verifyToken(token);
      
      if (clerkUser) {
        // Find user in our database by Clerk ID
        user = await User.findOne({ clerkId: clerkUser.sub }).select('-password');
        
        if (!user) {
          return res.status(401).json({ 
            success: false,
            message: 'User not found in database' 
          });
        }
      }
    } catch (clerkError) {
      // If Clerk verification fails, try JWT (backward compatibility)
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return res.status(401).json({ 
            success: false,
            message: 'User not found' 
          });
        }
      } catch (jwtError) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token' 
        });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during authentication' 
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Admin access required' 
    });
  }
};

// Middleware to check if user is alumni (can post jobs)
const requireAlumni = (req, res, next) => {
  if (req.user && (req.user.role === 'alumni' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Alumni access required' 
    });
  }
};

// Legacy exports for backward compatibility
exports.protect = requireAuth;
exports.admin = requireAdmin;

// Middleware to handle file uploads
exports.uploadMiddleware = (req, res, next) => {
  // This middleware will be implemented with multer
  // for handling file uploads like profile pictures
  next();
};