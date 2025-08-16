const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware.protect, authController.getCurrentUser);
router.put('/profile', authMiddleware.protect, authController.updateProfile);
router.put('/password', authMiddleware.protect, authController.changePassword);
router.put('/profile-picture', 
  authMiddleware.protect, 
  uploadMiddleware.profilePictureUpload,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Update user profile picture path
      const User = require('../models/user.model');
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { profilePicture: `/uploads/profiles/${req.file.filename}` },
        { new: true }
      ).select('-password');
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Profile picture upload error:', error);
      res.status(500).json({ message: 'Server error during profile picture upload' });
    }
  }
);

module.exports = router;