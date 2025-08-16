import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          {/* Logo and description */}
          <div className="mb-6 md:mb-0 md:w-1/3">
            <h2 className="text-xl font-bold mb-2">Alumni Network</h2>
            <p className="text-gray-400">
              Connect with fellow alumni, share experiences, and build professional relationships.
            </p>
          </div>
          
          {/* Quick links */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/users" className="text-gray-400 hover:text-white">Directory</Link>
              </li>
              <li>
                <Link to="/connections" className="text-gray-400 hover:text-white">Connections</Link>
              </li>
              <li>
                <Link to="/chat" className="text-gray-400 hover:text-white">Chat</Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white">My Profile</Link>
              </li>
              <li>
                <Link to="/profile/edit" className="text-gray-400 hover:text-white">Edit Profile</Link>
              </li>
              <li>
                <Link to="/connection-requests" className="text-gray-400 hover:text-white">Connection Requests</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact</h3>
            <p className="text-gray-400 mb-2">
              Have questions or feedback? Reach out to us.
            </p>
            <a href="mailto:support@alumninetwork.com" className="text-primary-400 hover:text-primary-300">
              support@alumninetwork.com
            </a>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400">
          <p>&copy; {currentYear} Alumni Network. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;