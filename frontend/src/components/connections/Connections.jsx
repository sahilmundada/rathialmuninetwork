import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch user connections
  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await axios.get('/users/connections/me');
        setConnections(response.data);
      } catch (err) {
        setError('Failed to load connections. Please try again.');
        console.error('Error fetching connections:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConnections();
  }, []);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle removing connection
  const removeConnection = async (userId) => {
    try {
      await axios.delete(`/users/connect/${userId}`);
      
      // Update connections list
      setConnections(connections.filter(conn => conn._id !== userId));
    } catch (err) {
      console.error('Error removing connection:', err);
    }
  };
  
  // Filter connections based on search term and active tab
  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (connection.currentPosition && connection.currentPosition.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (connection.company && connection.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === 'all') {
      return matchesSearch;
    } else if (activeTab === 'recent') {
      // Assuming connection has a createdAt field
      const isRecent = new Date(connection.connectedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
      return matchesSearch && isRecent;
    }
    
    return matchesSearch;
  });
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white py-4 px-6">
        <h2 className="text-2xl font-bold">My Connections</h2>
      </div>
      
      <div className="p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            onClick={() => setActiveTab('all')}
          >
            All Connections
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'recent' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            onClick={() => setActiveTab('recent')}
          >
            Recent Connections
          </button>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search connections..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Loading indicator */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Connections list */}
            {filteredConnections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredConnections.map(connection => (
                  <div key={connection._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="p-4">
                      <div className="flex items-center mb-4">
                        <img 
                          src={connection.profilePicture || '/uploads/default-profile.png'} 
                          alt={connection.name} 
                          className="h-16 w-16 rounded-full mr-4 object-cover"
                        />
                        <div>
                          <h3 className="font-bold text-lg">{connection.name}</h3>
                          <p className="text-gray-600">
                            {connection.currentPosition} {connection.company ? `at ${connection.company}` : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-4">
                        <p>{connection.department}, Class of {connection.graduationYear}</p>
                        {connection.location && <p>{connection.location}</p>}
                      </div>
                      
                      <div className="flex justify-between">
                        <Link 
                          to={`/users/${connection._id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          View Profile
                        </Link>
                        
                        <div className="flex space-x-2">
                          <Link 
                            to={`/chat?userId=${connection._id}`}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Message
                          </Link>
                          
                          <button 
                            onClick={() => removeConnection(connection._id)}
                            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                {searchTerm ? (
                  <>
                    <p className="text-gray-600 text-lg">No connections found matching "{searchTerm}".</p>
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Clear Search
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 text-lg">You don't have any connections yet.</p>
                    <Link 
                      to="/users"
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-block"
                    >
                      Find Alumni
                    </Link>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Connections;