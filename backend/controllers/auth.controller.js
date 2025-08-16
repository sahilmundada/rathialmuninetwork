const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, graduationYear, department } = req.body;

    // Check if MongoDB is connected
    if (process.env.NODE_ENV !== 'production' && global.mongodbDisconnected) {
      console.log('Mock registration in development mode without MongoDB');
      
      // Generate a mock user ID
      const mockUserId = 'mock_' + Date.now();
      
      // Generate JWT token with mock data
      const token = jwt.sign(
        { id: mockUserId, role: 'user' },
        process.env.JWT_SECRET || 'devjwtsecret',
        { expiresIn: '30d' }
      );

      // Return mock user data
      return res.status(201).json({
        token,
        user: {
          _id: mockUserId,
          name,
          email,
          graduationYear,
          department,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    // Normal MongoDB flow if connected
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      graduationYear,
      department
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if MongoDB is connected
    if (process.env.NODE_ENV !== 'production' && global.mongodbDisconnected) {
      console.log('Mock login in development mode without MongoDB');
      
      // Generate a mock user ID
      const mockUserId = 'mock_' + Date.now();
      
      // Generate JWT token with mock data
      const token = jwt.sign(
        { id: mockUserId, role: 'user' },
        process.env.JWT_SECRET || 'devjwtsecret',
        { expiresIn: '30d' }
      );

      // Return mock user data
      return res.json({
        token,
        user: {
          _id: mockUserId,
          name: 'Mock User',
          email,
          graduationYear: 2020,
          department: 'Computer Science',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    // Normal MongoDB flow if connected
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;

    res.json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (process.env.NODE_ENV !== 'production' && global.mongodbDisconnected) {
      console.log('Mock getCurrentUser in development mode without MongoDB');
      
      // Return mock user data based on the token ID
      return res.json({
        _id: req.user.id,
        name: 'Mock User',
        email: 'mock@example.com',
        graduationYear: 2020,
        department: 'Computer Science',
        role: req.user.role || 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Normal MongoDB flow if connected
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      currentPosition,
      company,
      location,
      skills,
      education,
      experience,
      social,
      graduationYear,
      department
    } = req.body;

    // Check if MongoDB is connected
    if (process.env.NODE_ENV !== 'production' && global.mongodbDisconnected) {
      console.log('Mock updateProfile in development mode without MongoDB');
      
      // Return mock updated user data
      return res.json({
        _id: req.user.id,
        name: name || 'Mock User',
        email: 'mock@example.com',
        bio: bio || 'Mock bio',
        currentPosition: currentPosition || 'Software Developer',
        company: company || 'Mock Company',
        location: location || 'Mock Location',
        skills: skills ? skills.split(',').map(skill => skill.trim()) : ['JavaScript', 'React'],
        education: education || [],
        experience: experience || [],
        social: social || {},
        graduationYear: graduationYear || 2020,
        department: department || 'Computer Science',
        role: req.user.role || 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (bio) profileFields.bio = bio;
    if (currentPosition) profileFields.currentPosition = currentPosition;
    if (company) profileFields.company = company;
    if (location) profileFields.location = location;
    if (graduationYear) profileFields.graduationYear = graduationYear;
    if (department) profileFields.department = department;
    
    // Build skills array
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    
    // Build social object
    if (social) profileFields.social = social;
    
    // Build education array
    if (education) profileFields.education = education;
    
    // Build experience array
    if (experience) profileFields.experience = experience;

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if MongoDB is connected
    if (process.env.NODE_ENV !== 'production' && global.mongodbDisconnected) {
      console.log('Mock changePassword in development mode without MongoDB');
      
      // Return mock success response
      return res.json({ message: 'Password updated successfully (mock)' });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
};