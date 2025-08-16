import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import SocketContext from '../../context/SocketContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { unreadCounts } = useContext(SocketContext);
  const [recentConnections, setRecentConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data in parallel
        const [connectionsRes, requestsRes, chatsRes] = await Promise.all([
          axios.get('/users/connections/me'),
          axios.get('/users/requests/pending'),
          axios.get('/messages/recent')
        ]);
        
        // Get most recent connections (up to 5)
        setRecentConnections(connectionsRes.data.slice(0, 5));
        
        // Get pending connection requests
        setPendingRequests(requestsRes.data);
        
        // Get recent chats
        setRecentChats(chatsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Calculate total unread messages
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg p-6 shadow-md">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-lg">Stay connected with your alumni network</p>
      </div>
      
      {/* Dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Your Profile</h2>
            <div className="flex items-center mb-4">
              <img 
                src={user?.profilePicture || '/uploads/default-profile.png'} 
                alt="Profile" 
                className="h-16 w-16 rounded-full mr-4 object-cover"
              />
              <div>
                <h3 className="font-bold">{user?.name}</h3>
                <p className="text-gray-600">{user?.department}, {user?.graduationYear}</p>
                <p className="text-gray-600">{user?.currentPosition} {user?.company ? `at ${user?.company}` : ''}</p>
              </div>
            </div>
            <Link 
              to="/profile" 
              className="block text-center bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition duration-300"
            >
              View Profile
            </Link>
          </div>
        </div>
        
        {/* Connection requests */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Connection Requests</h2>
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.slice(0, 3).map(request => (
                  <div key={request._id} className="flex items-center">
                    <img 
                      src={request.profilePicture || '/uploads/default-profile.png'} 
                      alt={request.name} 
                      className="h-10 w-10 rounded-full mr-3 object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{request.name}</h3>
                      <p className="text-sm text-gray-600">{request.currentPosition}</p>
                    </div>
                  </div>
                ))}
                {pendingRequests.length > 3 && (
                  <p className="text-sm text-gray-600">
                    +{pendingRequests.length - 3} more requests
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No pending connection requests</p>
            )}
            <Link 
              to="/connection-requests" 
              className="block text-center bg-primary-600 text-white py-2 px-4 rounded mt-4 hover:bg-primary-700 transition duration-300"
            >
              {pendingRequests.length > 0 ? 'View All Requests' : 'Check Requests'}
            </Link>
          </div>
        </div>
        
        {/* Messages */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
              Messages
              {totalUnread > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {totalUnread} new
                </span>
              )}
            </h2>
            {recentChats.length > 0 ? (
              <div className="space-y-4">
                {recentChats.map(chat => (
                  <div key={chat.user._id} className="flex items-center">
                    <img 
                      src={chat.user.profilePicture || '/uploads/default-profile.png'} 
                      alt={chat.user.name} 
                      className="h-10 w-10 rounded-full mr-3 object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{chat.user.name}</h3>
                        {unreadCounts[chat.user._id] > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCounts[chat.user._id]}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No recent messages</p>
            )}
            <Link 
              to="/chat" 
              className="block text-center bg-primary-600 text-white py-2 px-4 rounded mt-4 hover:bg-primary-700 transition duration-300"
            >
              Go to Messages
            </Link>
          </div>
        </div>
        
        {/* Recent connections */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Connections</h2>
            {recentConnections.length > 0 ? (
              <div className="space-y-4">
                {recentConnections.map(connection => (
                  <div key={connection._id} className="flex items-center">
                    <img 
                      src={connection.profilePicture || '/uploads/default-profile.png'} 
                      alt={connection.name} 
                      className="h-10 w-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{connection.name}</h3>
                      <p className="text-sm text-gray-600">
                        {connection.currentPosition} {connection.company ? `at ${connection.company}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No connections yet</p>
            )}
            <Link 
              to="/connections" 
              className="block text-center bg-primary-600 text-white py-2 px-4 rounded mt-4 hover:bg-primary-700 transition duration-300"
            >
              View All Connections
            </Link>
          </div>
        </div>
        
        {/* Find alumni */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Find Alumni</h2>
            <p className="text-gray-600 mb-4">
              Search for alumni by name, department, graduation year, or current company.
            </p>
            <Link 
              to="/users" 
              className="block text-center bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition duration-300"
            >
              Browse Directory
            </Link>
          </div>
        </div>
        
        {/* Quick chat */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Quick Chat</h2>
            <p className="text-gray-600 mb-4">
              Start a conversation with your connections through our real-time chat feature.
            </p>
            <Link 
              to="/chat" 
              className="block text-center bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition duration-300"
            >
              Start Chatting
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;