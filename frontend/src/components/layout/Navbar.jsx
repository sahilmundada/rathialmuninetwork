import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SocketContext from '../../context/SocketContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { unreadCounts } = useContext(SocketContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate total unread messages
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <nav className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold">Alumni Network</Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/" className="hover:text-primary-200">Dashboard</Link>
                <Link to="/users" className="hover:text-primary-200">Directory</Link>
                <Link to="/connections" className="hover:text-primary-200">Connections</Link>
                <Link to="/chat" className="hover:text-primary-200 relative">
                  Chat
                  {totalUnread > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalUnread}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center hover:text-primary-200 focus:outline-none">
                    <img 
                      src={user?.profilePicture || '/uploads/default-profile.png'} 
                      alt="Profile" 
                      className="h-8 w-8 rounded-full mr-2 object-cover"
                    />
                    <span>{user?.name}</span>
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-primary-500 hover:text-white">
                      My Profile
                    </Link>
                    <Link to="/profile/edit" className="block px-4 py-2 text-gray-800 hover:bg-primary-500 hover:text-white">
                      Edit Profile
                    </Link>
                    <Link to="/connection-requests" className="block px-4 py-2 text-gray-800 hover:bg-primary-500 hover:text-white">
                      Connection Requests
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-primary-500 hover:text-white"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary-200">Login</Link>
                <Link to="/register" className="bg-white text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            {isAuthenticated ? (
              <div className="flex flex-col space-y-3">
                <Link to="/" className="hover:text-primary-200" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/users" className="hover:text-primary-200" onClick={() => setIsMenuOpen(false)}>Directory</Link>
                <Link to="/connections" className="hover:text-primary-200" onClick={() => setIsMenuOpen(false)}>Connections</Link>
                <Link to="/chat" className="hover:text-primary-200 relative" onClick={() => setIsMenuOpen(false)}>
                  Chat
                  {totalUnread > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 inline-flex items-center justify-center">
                      {totalUnread}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="hover:text-primary-200" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                <Link to="/profile/edit" className="hover:text-primary-200" onClick={() => setIsMenuOpen(false)}>Edit Profile</Link>
                <Link to="/connection-requests" className="hover:text-primary-200" onClick={() => setIsMenuOpen(false)}>Connection Requests</Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left hover:text-primary-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link to="/login" className="hover:text-primary-200" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="hover:text-primary-200" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;