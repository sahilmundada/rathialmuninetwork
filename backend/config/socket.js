const Message = require('../models/message.model');
const User = require('../models/user.model');

module.exports = (io) => {
  // Store online users - maps userId to socketId
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User authentication and joining
    socket.on('authenticate', (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        io.emit('userOnline', Array.from(onlineUsers.keys()));
        console.log(`User ${userId} authenticated and is now online. Socket ID: ${socket.id}`);
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async (messageData) => {
      try {
        const { sender, receiver, content, attachment } = messageData;
        
        // If this is a new message (not from database), save it
        if (!messageData._id) {
          // Create new message document
          const newMessage = new Message({
            sender,
            receiver,
            content,
            attachments: attachment ? [attachment] : [],
            timestamp: new Date()
          });
          
          // Save to database
          const savedMessage = await newMessage.save();
          
          // Update the message data with saved info
          messageData._id = savedMessage._id;
          messageData.timestamp = savedMessage.timestamp;
        }
        
        // Find the socket ID of the receiver if they're online
        const receiverSocketId = onlineUsers.get(receiver);
        
        // Send the message to the receiver if they're online
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', messageData);
        }
        
        // Also send back to the sender to update their UI
        socket.emit('messageSent', messageData);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { sender, receiver, isTyping } = data;
      
      // Find the socket ID of the receiver if they're online
      const receiverSocketId = onlineUsers.get(receiver);
      
      // Send typing indicator to the receiver if they're online
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
          sender,
          isTyping
        });
      }
    });
    
    // Handle read receipts
    socket.on('markAsRead', async (data) => {
      try {
        const { conversationId, reader } = data;
        
        // Update messages in database
        await Message.updateMany(
          { 
            $or: [
              { sender: conversationId, receiver: reader },
              { sender: reader, receiver: conversationId }
            ],
            read: false 
          },
          { read: true }
        );
        
        // Find the socket ID of the sender if they're online
        const senderSocketId = onlineUsers.get(conversationId);
        
        // Send read receipt to the sender if they're online
        if (senderSocketId) {
          io.to(senderSocketId).emit('messagesRead', {
            reader,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Find and remove the disconnected user
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('userOffline', userId);
          io.emit('userOnline', Array.from(onlineUsers.keys()));
          console.log(`User ${userId} is offline`);
          break;
        }
      }
    });
    
    // Handle loading message history
    socket.on('loadMessages', async ({ userId, otherUserId }) => {
      try {
        // Fetch messages between these two users
        const messages = await Message.find({
          $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId }
          ]
        })
        .sort({ timestamp: 1 })
        .populate('sender', 'name profilePicture')
        .populate('receiver', 'name profilePicture');
        
        // Send messages to the requesting user
        socket.emit('messageHistory', messages);
        
        // Mark messages as read
        await Message.updateMany(
          { sender: otherUserId, receiver: userId, read: false },
          { read: true }
        );
      } catch (error) {
        console.error('Error loading messages:', error);
        socket.emit('messageError', { error: 'Failed to load messages' });
      }
    });
  });
};