const User = require('../models/user.model');

// Get all users (with pagination and filters)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, graduationYear } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Add search filter (name or email)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add department filter
    if (department) {
      filter.department = department;
    }
    
    // Add graduation year filter
    if (graduationYear) {
      filter.graduationYear = graduationYear;
    }
    
    // Exclude current user from results
    filter._id = { $ne: req.user.id };
    
    // Execute query with pagination
    const users = await User.find(filter)
      .select('name email profilePicture graduationYear department currentPosition company')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ name: 1 });
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('connections', 'name profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send connection request
exports.sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if connection request already sent
    const currentUser = await User.findById(req.user.id);
    if (currentUser.sentConnectionRequests.includes(userId)) {
      return res.status(400).json({ message: 'Connection request already sent' });
    }
    
    // Check if users are already connected
    if (currentUser.connections.includes(userId)) {
      return res.status(400).json({ message: 'Users are already connected' });
    }
    
    // Add to sent connection requests for current user
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { sentConnectionRequests: userId }
    });
    
    // Add to connection requests for target user
    await User.findByIdAndUpdate(userId, {
      $addToSet: { connectionRequests: req.user.id }
    });
    
    res.json({ message: 'Connection request sent successfully' });
  } catch (error) {
    console.error('Send connection request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept connection request
exports.acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if connection request exists
    const currentUser = await User.findById(req.user.id);
    if (!currentUser.connectionRequests.includes(userId)) {
      return res.status(400).json({ message: 'No connection request from this user' });
    }
    
    // Update both users' connections
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { connections: userId },
      $pull: { connectionRequests: userId }
    });
    
    await User.findByIdAndUpdate(userId, {
      $addToSet: { connections: req.user.id },
      $pull: { sentConnectionRequests: req.user.id }
    });
    
    res.json({ message: 'Connection request accepted' });
  } catch (error) {
    console.error('Accept connection request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject connection request
exports.rejectConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Remove connection request
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { connectionRequests: userId }
    });
    
    await User.findByIdAndUpdate(userId, {
      $pull: { sentConnectionRequests: req.user.id }
    });
    
    res.json({ message: 'Connection request rejected' });
  } catch (error) {
    console.error('Reject connection request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user connections
exports.getUserConnections = async (req, res) => {
  try {
    const user = await User.findById(req.params.id || req.user.id)
      .select('connections')
      .populate('connections', 'name email profilePicture currentPosition company');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.connections);
  } catch (error) {
    console.error('Get user connections error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get connection requests
exports.getConnectionRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('connectionRequests')
      .populate('connectionRequests', 'name email profilePicture currentPosition company');
    
    res.json(user.connectionRequests);
  } catch (error) {
    console.error('Get connection requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove connection
exports.removeConnection = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Remove connection from both users
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { connections: userId }
    });
    
    await User.findByIdAndUpdate(userId, {
      $pull: { connections: req.user.id }
    });
    
    res.json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};