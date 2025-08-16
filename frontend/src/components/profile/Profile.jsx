import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('about');
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Profile header */}
      <div className="relative">
        {/* Cover photo */}
        <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        
        {/* Profile picture */}
        <div className="absolute left-6 -bottom-16">
          <img 
            src={user.profilePicture || '/uploads/default-profile.png'} 
            alt={user.name} 
            className="h-32 w-32 rounded-full border-4 border-white object-cover"
          />
        </div>
        
        {/* Edit profile button */}
        <div className="absolute right-6 bottom-6">
          <Link 
            to="/profile/edit" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Edit Profile
          </Link>
        </div>
      </div>
      
      {/* Profile info */}
      <div className="mt-20 px-6 pb-6">
        <h1 className="text-3xl font-bold">{user.name}</h1>
        <p className="text-gray-600 mt-1">{user.currentPosition} {user.company ? `at ${user.company}` : ''}</p>
        <p className="text-gray-600">{user.department}, Class of {user.graduationYear}</p>
        <p className="text-gray-600">{user.location}</p>
        
        {/* Social links */}
        {user.social && Object.values(user.social).some(link => link) && (
          <div className="flex mt-4 space-x-4">
            {user.social.linkedin && (
              <a href={user.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                <i className="fab fa-linkedin fa-lg"></i>
              </a>
            )}
            {user.social.twitter && (
              <a href={user.social.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                <i className="fab fa-twitter fa-lg"></i>
              </a>
            )}
            {user.social.github && (
              <a href={user.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-600">
                <i className="fab fa-github fa-lg"></i>
              </a>
            )}
            {user.social.website && (
              <a href={user.social.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                <i className="fas fa-globe fa-lg"></i>
              </a>
            )}
          </div>
        )}
      </div>
      
      {/* Profile tabs */}
      <div className="border-t border-gray-200">
        <div className="flex">
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'experience' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            onClick={() => setActiveTab('experience')}
          >
            Experience
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'education' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            onClick={() => setActiveTab('education')}
          >
            Education
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'skills' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
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
              {user.bio ? (
                <p className="text-gray-700 whitespace-pre-line">{user.bio}</p>
              ) : (
                <p className="text-gray-500 italic">No bio information added yet.</p>
              )}
            </div>
          )}
          
          {/* Experience tab */}
          {activeTab === 'experience' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Experience</h2>
              {user.experience && user.experience.length > 0 ? (
                <div className="space-y-6">
                  {user.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-500 pl-4">
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
                <p className="text-gray-500 italic">No experience added yet.</p>
              )}
            </div>
          )}
          
          {/* Education tab */}
          {activeTab === 'education' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Education</h2>
              {user.education && user.education.length > 0 ? (
                <div className="space-y-6">
                  {user.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-blue-500 pl-4">
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
                <p className="text-gray-500 italic">No education added yet.</p>
              )}
            </div>
          )}
          
          {/* Skills tab */}
          {activeTab === 'skills' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Skills</h2>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No skills added yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;