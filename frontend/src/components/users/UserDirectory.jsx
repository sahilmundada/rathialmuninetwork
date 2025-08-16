import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const UserDirectory = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    graduationYear: '',
    company: ''
  });
  
  // Fetch users with pagination and filters
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', 10);
        
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        if (filters.department) {
          params.append('department', filters.department);
        }
        
        if (filters.graduationYear) {
          params.append('graduationYear', filters.graduationYear);
        }
        
        if (filters.company) {
          params.append('company', filters.company);
        }
        
        const response = await axios.get(`/users?${params.toString()}`);
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        setError('Failed to fetch users. Please try again.');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [page, searchTerm, filters]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPage(1); // Reset to first page on new filter
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      department: '',
      graduationYear: '',
      company: ''
    });
    setPage(1);
  };
  
  // Handle connection request
  const sendConnectionRequest = async (userId) => {
    try {
      await axios.post(`/users/connect/${userId}`);
      
      // Update the user's status in the list
      setUsers(users.map(u => {
        if (u._id === userId) {
          return { ...u, connectionStatus: 'pending' };
        }
        return u;
      }));
    } catch (err) {
      console.error('Error sending connection request:', err);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white py-4 px-6">
        <h2 className="text-2xl font-bold">Alumni Directory</h2>
      </div>
      
      <div className="p-6">
        {/* Search and filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center mb-4">
            <div className="flex-1 mb-4 md:mb-0 md:mr-4">
              <input
                type="text"
                placeholder="Search by name, position, or skills..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <button
              onClick={clearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Clear Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="department">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Arts">Arts</option>
                <option value="Science">Science</option>
                <option value="Medicine">Medicine</option>
                <option value="Law">Law</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="graduationYear">
                Graduation Year
              </label>
              <select
                id="graduationYear"
                name="graduationYear"
                value={filters.graduationYear}
                onChange={handleFilterChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">All Years</option>
                {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={filters.company}
                onChange={handleFilterChange}
                placeholder="Filter by company"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
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
            {/* User list */}
            {users.length > 0 ? (
              <div className="space-y-6">
                {users.map(alumni => (
                  <div key={alumni._id} className="border rounded-lg p-4 flex flex-col md:flex-row">
                    <div className="md:w-1/6 flex justify-center mb-4 md:mb-0">
                      <img 
                        src={alumni.profilePicture || '/uploads/default-profile.png'} 
                        alt={alumni.name} 
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    </div>
                    
                    <div className="md:w-3/6 md:px-4">
                      <h3 className="text-xl font-bold">{alumni.name}</h3>
                      <p className="text-gray-600">{alumni.department}, Class of {alumni.graduationYear}</p>
                      <p className="text-gray-700 mt-1">
                        {alumni.currentPosition} {alumni.company ? `at ${alumni.company}` : ''}
                      </p>
                      <p className="text-gray-600 mt-1">{alumni.location}</p>
                      
                      {alumni.skills && alumni.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {alumni.skills.slice(0, 5).map((skill, index) => (
                            <span 
                              key={index} 
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {alumni.skills.length > 5 && (
                            <span className="text-gray-500 text-xs">+{alumni.skills.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="md:w-2/6 flex flex-col justify-center items-center md:items-end mt-4 md:mt-0">
                      <Link 
                        to={`/users/${alumni._id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto text-center mb-2"
                      >
                        View Profile
                      </Link>
                      
                      {alumni._id !== user?._id && (
                        <>
                          {alumni.connectionStatus === 'connected' ? (
                            <Link 
                              to={`/chat?userId=${alumni._id}`}
                              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto text-center"
                            >
                              Message
                            </Link>
                          ) : alumni.connectionStatus === 'pending' ? (
                            <button 
                              className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto cursor-not-allowed"
                              disabled
                            >
                              Request Sent
                            </button>
                          ) : (
                            <button 
                              onClick={() => sendConnectionRequest(alumni._id)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto"
                            >
                              Connect
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 text-lg">No alumni found matching your criteria.</p>
                <button 
                  onClick={clearFilters}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Clear Filters
                </button>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-l-md border ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 border-t border-b ${page === pageNum ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-r-md border ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDirectory;