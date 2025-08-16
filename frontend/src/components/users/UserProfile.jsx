import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const UserProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('about');
  const [connectionStatus, setConnectionStatus] = useState(null);
  
  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await axios.get(`/users/${id}`);
        setProfile(response.data);
        setConnectionStatus(response.data.connectionStatus);
      } catch (err) {
        setError('Failed to load profile. Please try again.');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id]);
  
  // Handle connection request
  const sendConnectionRequest = async () => {
    try {
      await axios.post(`/users/connect/${id}`);
      setConnectionStatus('pending');
    } catch (err) {
      console.error('Error sending connection request:', err);
    }
  };
  
  // Handle accepting connection request
  const acceptConnectionRequest = async () => {
    try {
      await axios.post(`/users/connect/${id}/accept`);
      setConnectionStatus('connected');
    } catch (err) {
      console.error('Error accepting connection request:', err);
    }
  };
  
  // Handle rejecting connection request
  const rejectConnectionRequest = async () => {
    try {
      await axios.post(`/users/connect/${id}/reject`);
      setConnectionStatus(null);
    } catch (err) {
      console.error('Error rejecting connection request:', err);
    }
  };
  
  // Handle removing connection
  const removeConnection = async () => {
    try {
      await axios.delete(`/users/connect/${id}`);
      setConnectionStatus(null);
    } catch (err) {
      console.error('Error removing connection:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded" role="alert">
        <p className="font-bold">User Not Found</p>
        <p>The requested profile could not be found.</p>
      </div>
    );
  }
  
  // Check if this is the current user's profile
  const isCurrentUser = user?._id === profile._id;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Profile header */}
      <div className="relative">
        {/* Cover photo */}
        <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600"></div>
        
        {/* Profile picture */}
        <div className="absolute left-6 -bottom-16">
          <img 
            src={profile.profilePicture || '/uploads/default-profile.png'} 
            alt={profile.name} 
            className="h-32 w-32 rounded-full border-4 border-white object-cover"
          />
        </div>
        
        {/* Action buttons */}
        <div className="absolute right-6 bottom-6 flex space-x-2">
          {isCurrentUser ? (
            <Link 
              to="/profile/edit" 
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition duration-300"
            >
              Edit Profile
            </Link>
          ) : (
            <>
              {connectionStatus === 'connected' && (
                <>
                  <Link 
                    to={`/chat?userId=${profile._id}`}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-300"
                  >
                    Message
                  </Link>
                  <button 
                    onClick={removeConnection}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md transition duration-300"
                  >
                    Remove Connection
                  </button>
                </>
              )}
              
              {connectionStatus === 'pending-them' && (
                <button 
                  onClick={sendConnectionRequest}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition duration-300"
                >
                  Connect
                </button>
              )}
              
              {connectionStatus === 'pending-you' && (
                <div className="flex space-x-2">
                  <button 
                    onClick={acceptConnectionRequest}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-300"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={rejectConnectionRequest}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md transition duration-300"
                  >
                    Decline
                  </button>
                </div>
              )}
              
              {connectionStatus === 'pending' && (
                <button 
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-not-allowed"
                  disabled
                >
                  Request Sent
                </button>
              )}
              
              {!connectionStatus && (
                <button 
                  onClick={sendConnectionRequest}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition duration-300"
                >
                  Connect
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Profile info */}
      <div className="mt-20 px-6 pb-6">
        <h1 className="text-3xl font-bold">{profile.name}</h1>
        <p className="text-gray-600 mt-1">{profile.currentPosition} {profile.company ? `at ${profile.company}` : ''}</p>
        <p className="text-gray-600">{profile.department}, Class of {profile.graduationYear}</p>
        <p className="text-gray-600">{profile.location}</p>
        
        {/* Social links */}
        {profile.social && Object.values(profile.social).some(link => link) && (
          <div className="flex mt-4 space-x-4">
            {profile.social.linkedin && (
              <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800">
                <i className="fab fa-linkedin fa-lg"></i>
              </a>
            )}
            {profile.social.twitter && (
              <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-600">
                <i className="fab fa-twitter fa-lg"></i>
              </a>
            )}
            {profile.social.github && (
              <a href={profile.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-600">
                <i className="fab fa-github fa-lg"></i>
              </a>
            )}
            {profile.social.website && (
              <a href={profile.social.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                <i className="fas fa-globe fa-lg"></i>
              </a>
            )}
          </div>
        )}
      </div>
      
      {/* Profile tabs */}
      <div className="border-t border-gray-200">
        <div className="flex overflow-x-auto">
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'about' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'experience' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
            onClick={() => setActiveTab('experience')}
          >
            Experience
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'education' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
            onClick={() => setActiveTab('education')}
          >
            Education
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'skills' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
            onClick={() => setActiveTab('skills')}
          >
            Skills
          </button>
        </div>
        
        <div className="p-6">
          {/* About tab */}
          {activeTab === 'about' && (
            <div>
              <h2 className="text-xl font-bold mb-4">About</h2>
              {profile.bio ? (
                <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
              ) : (
                <p className="text-gray-500 italic">No bio information available.</p>
              )}
            </div>
          )}
          
          {/* Experience tab */}
          {activeTab === 'experience' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Experience</h2>
              {profile.experience && profile.experience.length > 0 ? (
                <div className="space-y-6">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-primary-500 pl-4">
                      <h3 className="font-bold text-lg">{exp.title}</h3>
                      <p className="text-gray-700">{exp.company} • {exp.location}</p>
                      <p className="text-gray-600">
                        {new Date(exp.from).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                        {exp.current ? 'Present' : new Date(exp.to).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 mt-2 whitespace-pre-line">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No experience information available.</p>
              )}
            </div>
          )}
          
          {/* Education tab */}
          {activeTab === 'education' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Education</h2>
              {profile.education && profile.education.length > 0 ? (
                <div className="space-y-6">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-primary-500 pl-4">
                      <h3 className="font-bold text-lg">{edu.institution}</h3>
                      <p className="text-gray-700">{edu.degree} • {edu.fieldOfStudy}</p>
                      <p className="text-gray-600">
                        {new Date(edu.from).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                        {edu.current ? 'Present' : new Date(edu.to).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </p>
                      {edu.description && (
                        <p className="text-gray-700 mt-2 whitespace-pre-line">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No education information available.</p>
              )}
            </div>
          )}
          
          {/* Skills tab */}
          {activeTab === 'skills' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Skills</h2>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No skills information available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;