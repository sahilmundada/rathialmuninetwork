import { useState, useEffect, useRef, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import SocketContext from '../../context/SocketContext';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { 
    // eslint-disable-next-line no-unused-vars
    socket,
    onlineUsers, 
    messages, 
    // eslint-disable-next-line no-unused-vars
    setMessages,
    activeChat, 
    setActiveChat,
    sendMessage: socketSendMessage,
    markAsRead,
    setTyping,
    isTyping,
    loadMessages
  } = useContext(SocketContext);
  
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();
  
  // Fetch user connections
  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await axios.get('/users/connections/me');
        setConnections(response.data);
        
        // Check if there's a userId in the URL query params
        const params = new URLSearchParams(location.search);
        const userId = params.get('userId');
        
        if (userId) {
          // Find the connection with this ID
          const connection = response.data.find(conn => conn._id === userId);
          if (connection) {
            setActiveChat(connection);
            loadMessages(userId);
          }
        }
      } catch (err) {
        setError('Failed to load connections. Please try again.');
        console.error('Error fetching connections:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConnections();
  }, [location.search, setActiveChat, loadMessages]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle typing indicator
  useEffect(() => {
    let typingTimeout;
    
    if (messageInput && activeChat) {
      setTyping(activeChat._id, true);
      
      typingTimeout = setTimeout(() => {
        setTyping(activeChat._id, false);
      }, 3000);
    } else if (activeChat) {
      setTyping(activeChat._id, false);
    }
    
    return () => {
      clearTimeout(typingTimeout);
    };
  }, [messageInput, activeChat, setTyping]);
  
  // Filter connections based on search term
  const filteredConnections = connections.filter(connection => {
    return connection.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Handle selecting a chat
  const handleSelectChat = (connection) => {
    setActiveChat(connection);
    loadMessages(connection._id);
    markAsRead(connection._id);
  };
  
  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!messageInput.trim() && !attachment) || !activeChat) return;
    
    try {
      if (attachment) {
        // Send message with attachment
        const formData = new FormData();
        formData.append('content', messageInput);
        formData.append('attachment', attachment);
        
        const response = await axios.post(`/messages/${activeChat._id}/attachment`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Add message to state
        socketSendMessage({
          ...response.data,
          sender: user,
          receiver: activeChat
        });
        
        // Clear attachment
        setAttachment(null);
      } else {
        // Send text message
        socketSendMessage({
          receiver: activeChat._id,
          content: messageInput
        });
      }
      
      // Clear input
      setMessageInput('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };
  
  // Remove selected attachment
  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date for message groups
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-[calc(100vh-12rem)]">
      <div className="flex h-full">
        {/* Connections sidebar */}
        <div className="w-1/4 border-r border-gray-200 h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Connections list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : filteredConnections.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No conversations match your search.' : 'No connections yet.'}
                {!searchTerm && (
                  <Link 
                    to="/users" 
                    className="block mt-2 text-blue-500 hover:underline"
                  >
                    Find alumni to connect with
                  </Link>
                )}
              </div>
            ) : (
              <div>
                {filteredConnections.map(connection => {
                  const isActive = activeChat?._id === connection._id;
                  const isOnline = onlineUsers.includes(connection._id);
                  
                  return (
                    <div 
                      key={connection._id}
                      onClick={() => handleSelectChat(connection)}
                      className={`p-3 border-b border-gray-100 flex items-center cursor-pointer hover:bg-gray-50 ${isActive ? 'bg-blue-50' : ''}`}
                    >
                      <div className="relative">
                        <img 
                          src={connection.profilePicture || '/uploads/default-profile.png'} 
                          alt={connection.name} 
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{connection.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {connection.currentPosition || connection.department}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Chat area */}
        <div className="w-3/4 flex flex-col h-full">
          {activeChat ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <img 
                  src={activeChat.profilePicture || '/uploads/default-profile.png'} 
                  alt={activeChat.name} 
                  className="h-10 w-10 rounded-full object-cover mr-3"
                />
                <div>
                  <h3 className="font-medium">{activeChat.name}</h3>
                  <p className="text-sm text-gray-500">
                    {onlineUsers.includes(activeChat._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
                <Link 
                  to={`/users/${activeChat._id}`}
                  className="ml-auto text-blue-500 hover:text-blue-700"
                >
                  View Profile
                </Link>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <p>No messages yet.</p>
                    <p>Send a message to start the conversation!</p>
                  </div>
                ) : (
                  <div>
                    {groupMessagesByDate().map((group, groupIndex) => (
                      <div key={groupIndex} className="mb-6">
                        <div className="text-center mb-4">
                          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {formatDate(new Date(group.date))}
                          </span>
                        </div>
                        
                        {group.messages.map((message, index) => {
                          const isSender = message.sender._id === user._id;
                          
                          return (
                            <div 
                              key={message._id || index}
                              className={`mb-4 flex ${isSender ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[70%] ${isSender ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg px-4 py-2 shadow-sm`}>
                                {message.content && (
                                  <p className="whitespace-pre-wrap">{message.content}</p>
                                )}
                                
                                {message.attachment && (
                                  <div className="mt-2">
                                    {message.attachment.mimetype.startsWith('image/') ? (
                                      <img 
                                        src={message.attachment.path} 
                                        alt="Attachment" 
                                        className="max-w-full rounded"
                                      />
                                    ) : (
                                      <a 
                                        href={message.attachment.path} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center text-sm underline"
                                      >
                                        <i className="fas fa-file mr-1"></i>
                                        {message.attachment.originalname}
                                      </a>
                                    )}
                                  </div>
                                )}
                                
                                <div className={`text-xs mt-1 ${isSender ? 'text-blue-200' : 'text-gray-500'}`}>
                                  {formatTime(message.createdAt)}
                                  {isSender && message.read && (
                                    <span className="ml-1">✓</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    
                    {/* Typing indicator */}
                    {isTyping[activeChat._id] && (
                      <div className="flex items-center mb-4">
                        <div className="bg-gray-100 text-gray-500 rounded-lg px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-75"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-150"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <div className="p-4 border-t border-gray-200">
                {attachment && (
                  <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center">
                    <span className="text-sm truncate flex-1">{attachment.name}</span>
                    <button 
                      onClick={removeAttachment}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
                
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="text-gray-500 hover:text-gray-700 mr-2"
                  >
                    <i className="fas fa-paperclip"></i>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <button 
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg"
                    disabled={!messageInput.trim() && !attachment}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
              <i className="fas fa-comments text-6xl mb-4"></i>
              <h3 className="text-xl font-medium mb-2">Your Messages</h3>
              <p className="text-center mb-4">Select a conversation or start a new one with your connections.</p>
              <Link 
                to="/users" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Find Alumni
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;