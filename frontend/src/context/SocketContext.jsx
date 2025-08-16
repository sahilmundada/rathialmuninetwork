import { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import AuthContext from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const { user } = useContext(AuthContext);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    // Connect to socket server
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      withCredentials: true,
    });

    setSocket(newSocket);

    // Authenticate with user ID
    newSocket.emit('authenticate', user._id);

    // Listen for online users
    newSocket.on('userOnline', (users) => {
      setOnlineUsers(users);
    });

    // Listen for new messages
    newSocket.on('newMessage', (message) => {
      // Add message to state
      setMessages((prevMessages) => {
        const senderId = message.sender._id;
        const newMessages = { ...prevMessages };
        
        if (!newMessages[senderId]) {
          newMessages[senderId] = [];
        }
        
        newMessages[senderId] = [...newMessages[senderId], message];
        
        return newMessages;
      });

      // Update unread count if not in active chat
      if (activeChat !== message.sender._id) {
        setUnreadCounts((prevCounts) => ({
          ...prevCounts,
          [message.sender._id]: (prevCounts[message.sender._id] || 0) + 1
        }));
      }
    });

    // Listen for message sent confirmation
    newSocket.on('messageSent', (message) => {
      setMessages((prevMessages) => {
        const receiverId = message.receiver;
        const newMessages = { ...prevMessages };
        
        if (!newMessages[receiverId]) {
          newMessages[receiverId] = [];
        }
        
        newMessages[receiverId] = [...newMessages[receiverId], message];
        
        return newMessages;
      });
    });

    // Listen for user offline
    newSocket.on('userOffline', (userId) => {
      setOnlineUsers((prevUsers) => prevUsers.filter(id => id !== userId));
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user, activeChat]);

  // Set active chat and reset unread count
  const setActiveChatUser = (userId) => {
    setActiveChat(userId);
    setUnreadCounts((prevCounts) => ({
      ...prevCounts,
      [userId]: 0
    }));
  };

  // Send a message
  const sendMessage = (receiverId, content) => {
    if (!socket || !user) return;

    socket.emit('privateMessage', {
      senderId: user._id,
      receiverId,
      content
    });
  };

  // Send typing indicator
  const sendTypingIndicator = (receiverId) => {
    if (!socket || !user) return;

    socket.emit('typing', {
      senderId: user._id,
      receiverId
    });
  };

  // Send stop typing indicator
  const sendStopTypingIndicator = (receiverId) => {
    if (!socket || !user) return;

    socket.emit('stopTyping', {
      senderId: user._id,
      receiverId
    });
  };

  // Load messages for a conversation
  const loadMessages = async (userId) => {
    try {
      const res = await fetch(`/api/messages/conversation/${userId}`);
      const data = await res.json();
      
      setMessages((prevMessages) => ({
        ...prevMessages,
        [userId]: data
      }));
      
      return data;
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        messages,
        unreadCounts,
        activeChat,
        setActiveChatUser,
        sendMessage,
        sendTypingIndicator,
        sendStopTypingIndicator,
        loadMessages,
        isOnline: (userId) => onlineUsers.includes(userId)
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;