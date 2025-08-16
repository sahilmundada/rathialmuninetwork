const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');

// All routes are protected
router.use(authMiddleware.protect);

// Get conversation with a user
router.get('/conversation/:userId', messageController.getConversation);

// Get recent conversations
router.get('/recent', messageController.getRecentConversations);

// Send a message (without attachments)
router.post('/send', messageController.sendMessage);

// Send a message with attachments
router.post('/send-with-attachments', 
  uploadMiddleware.messageAttachmentsUpload,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      
      // Add file paths to request body
      req.body.attachments = req.files.map(file => `/uploads/messages/${file.filename}`);
      
      // Forward to regular send message controller
      messageController.sendMessage(req, res);
    } catch (error) {
      console.error('Message with attachments error:', error);
      res.status(500).json({ message: 'Server error during message upload' });
    }
  }
);

// Mark messages as read
router.put('/read/:senderId', messageController.markMessagesAsRead);

// Delete a message
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;