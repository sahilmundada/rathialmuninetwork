import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const ConnectionRequests = () => {
  const { user: _ } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  
  // Fetch connection requests
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await axios.get('/users/connections/requests');
        setRequests(response.data);
      } catch (err) {
        setError('Failed to load connection requests. Please try again.');
        console.error('Error fetching connection requests:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, []);
  
  // Accept connection request
  const acceptRequest = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      await axios.post(`/users/connections/accept/${userId}`);
      
      // Remove from requests list
      setRequests(requests.filter(request => request._id !== userId));
    } catch (err) {
      setError('Failed to accept connection request. Please try again.');
      console.error('Error accepting connection request:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  // Reject connection request
  const rejectRequest = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      await axios.post(`/users/connections/reject/${userId}`);
      
      // Remove from requests list
      setRequests(requests.filter(request => request._id !== userId));
    } catch (err) {
      setError('Failed to reject connection request. Please try again.');
      console.error('Error rejecting connection request:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Connection Requests</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <i className="fas fa-user-friends text-5xl"></i>
          </div>
          <h3 className="text-xl font-medium mb-2">No pending requests</h3>
          <p className="text-gray-500 mb-4">You don't have any pending connection requests at the moment.</p>
          <Link 
            to="/users" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Find Alumni
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map(request => (
            <div key={request._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <img 
                    src={request.profilePicture || '/uploads/default-profile.png'} 
                    alt={request.name} 
                    className="h-16 w-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-medium text-lg">{request.name}</h3>
                    <p className="text-gray-500">
                      {request.currentPosition || request.department}
                    </p>
                    <p className="text-sm text-gray-500">
                      {request.graduationYear && `Class of ${request.graduationYear}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link 
                    to={`/users/${request._id}`}
                    className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    View Profile
                  </Link>
                  
                  <button
                    onClick={() => acceptRequest(request._id)}
                    disabled={actionLoading[request._id]}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    {actionLoading[request._id] ? (
                      <span className="flex justify-center items-center">
                        <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                        <span>Accepting...</span>
                      </span>
                    ) : 'Accept'}
                  </button>
                  
                  <button
                    onClick={() => rejectRequest(request._id)}
                    disabled={actionLoading[request._id]}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    {actionLoading[request._id] ? (
                      <span className="flex justify-center items-center">
                        <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-gray-600 rounded-full mr-2"></span>
                        <span>Rejecting...</span>
                      </span>
                    ) : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionRequests;