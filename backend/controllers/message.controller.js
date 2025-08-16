const Message = require('../models/message.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    // Validate that the users exist
    const [user, currentUser] = await Promise.all([
      User.findById(userId),
      User.findById(currentUserId)
    ]);
    
    if (!user || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .sort({ timestamp: 1 })
    .populate('sender', 'name profilePicture')
    .populate('receiver', 'name profilePicture');
    
    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );
    
    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, attachments } = req.body;
    const senderId = req.user.id;
    
    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    
    // Create new message
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      attachments: attachments || [],
      timestamp: new Date()
    });
    
    await newMessage.save();
    
    // Populate sender info
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name profilePicture')
      .populate('receiver', 'name profilePicture');
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent conversations
exports.getRecentConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    // Aggregate to get the most recent message with each user
    const conversations = await Message.aggregate([
      // Match messages where current user is either sender or receiver
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(currentUserId) },
            { receiver: mongoose.Types.ObjectId(currentUserId) }
          ]
        }
      },
      // Sort by timestamp descending to get the most recent messages first
      { $sort: { timestamp: -1 } },
      // Group by the conversation partner
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", mongoose.Types.ObjectId(currentUserId)] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$receiver", mongoose.Types.ObjectId(currentUserId)] },
                  { $eq: ["$read", false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    // Get user details for each conversation partner
    const userIds = conversations.map(conv => conv._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name profilePicture');
    
    // Map users to conversations
    const userMap = {};
    users.forEach(user => {
      userMap[user._id] = user;
    });
    
    const result = conversations.map(conv => ({
      user: userMap[conv._id],
      lastMessage: conv.lastMessage,
      unreadCount: conv.unreadCount
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Get recent conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const currentUserId = req.user.id;
    
    // Update all unread messages from sender to current user
    const result = await Message.updateMany(
      { sender: senderId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );
    
    res.json({ message: 'Messages marked as read', count: result.nModified });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;
    
    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if current user is the sender
    if (message.sender.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    
    await message.remove();
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};