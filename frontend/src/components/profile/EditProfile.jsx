import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const EditProfile = () => {
  const { user, updateProfile, updateProfilePicture } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    currentPosition: '',
    company: '',
    department: '',
    graduationYear: '',
    skills: [],
    social: {
      linkedin: '',
      twitter: '',
      github: '',
      website: ''
    },
    experience: [],
    education: []
  });
  
  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Initialize form data with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        currentPosition: user.currentPosition || '',
        company: user.company || '',
        department: user.department || '',
        graduationYear: user.graduationYear || '',
        skills: user.skills || [],
        social: {
          linkedin: user.social?.linkedin || '',
          twitter: user.social?.twitter || '',
          github: user.social?.github || '',
          website: user.social?.website || ''
        },
        experience: user.experience || [],
        education: user.education || []
      });
      
      if (user.profilePicture) {
        setPreviewUrl(user.profilePicture);
      }
    }
  }, [user]);
  
  // Handle basic info changes
  const handleBasicChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle social links changes
  const handleSocialChange = (e) => {
    setFormData({
      ...formData,
      social: {
        ...formData.social,
        [e.target.name]: e.target.value
      }
    });
  };
  
  // Handle skills changes
  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
    setFormData({
      ...formData,
      skills: skillsArray
    });
  };
  
  // Handle experience changes
  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      experience: updatedExperience
    });
  };
  
  // Add new experience
  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        {
          title: '',
          company: '',
          location: '',
          from: '',
          to: '',
          current: false,
          description: ''
        }
      ]
    });
  };
  
  // Remove experience
  const removeExperience = (index) => {
    const updatedExperience = [...formData.experience];
    updatedExperience.splice(index, 1);
    
    setFormData({
      ...formData,
      experience: updatedExperience
    });
  };
  
  // Handle education changes
  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      education: updatedEducation
    });
  };
  
  // Add new education
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          institution: '',
          degree: '',
          fieldOfStudy: '',
          from: '',
          to: '',
          current: false,
          description: ''
        }
      ]
    });
  };
  
  // Remove education
  const removeEducation = (index) => {
    const updatedEducation = [...formData.education];
    updatedEducation.splice(index, 1);
    
    setFormData({
      ...formData,
      education: updatedEducation
    });
  };
  
  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Update profile data
      await updateProfile(formData);
      
      // Update profile picture if changed
      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);
        await updateProfilePicture(formData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white py-4 px-6">
        <h2 className="text-2xl font-bold">Edit Profile</h2>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-6 rounded" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 m-6 rounded" role="alert">
          <span className="block sm:inline">Profile updated successfully! Redirecting...</span>
        </div>
      )}
      
      <div className="p-6">
        {/* Profile picture section */}
        <div className="mb-6 flex items-center">
          <div className="mr-6">
            <img 
              src={previewUrl || '/uploads/default-profile.png'} 
              alt="Profile" 
              className="h-24 w-24 rounded-full object-cover"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Profile Picture
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleProfilePictureChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">Max file size: 5MB. Recommended: 300x300px</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'basic' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Info
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'social' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveTab('social')}
            >
              Social Links
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'experience' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveTab('experience')}
            >
              Experience
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'education' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveTab('education')}
            >
              Education
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleBasicChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleBasicChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="department">
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleBasicChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="graduationYear">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    id="graduationYear"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleBasicChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPosition">
                    Current Position
                  </label>
                  <input
                    type="text"
                    id="currentPosition"
                    name="currentPosition"
                    value={formData.currentPosition}
                    onChange={handleBasicChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleBasicChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleBasicChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="City, Country"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="skills">
                    Skills
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills.join(', ')}
                    onChange={handleSkillsChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Separate skills with commas"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleBasicChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="4"
                  placeholder="Tell us about yourself"
                ></textarea>
              </div>
            </div>
          )}
          
          {/* Social Links Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="linkedin">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.social.linkedin}
                  onChange={handleSocialChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="twitter">
                  Twitter Profile
                </label>
                <input
                  type="url"
                  id="twitter"
                  name="twitter"
                  value={formData.social.twitter}
                  onChange={handleSocialChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="https://twitter.com/username"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="github">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  id="github"
                  name="github"
                  value={formData.social.github}
                  onChange={handleSocialChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="https://github.com/username"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="website">
                  Personal Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.social.website}
                  onChange={handleSocialChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          )}
          
          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div>
              {formData.experience.map((exp, index) => (
                <div key={index} className="mb-8 p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Experience #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        From
                      </label>
                      <input
                        type="date"
                        value={exp.from ? exp.from.substring(0, 10) : ''}
                        onChange={(e) => handleExperienceChange(index, 'from', e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`current-${index}`}
                        checked={exp.current}
                        onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={`current-${index}`} className="text-gray-700 text-sm font-bold">
                        I currently work here
                      </label>
                    </div>
                    
                    {!exp.current && (
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          To
                        </label>
                        <input
                          type="date"
                          value={exp.to ? exp.to.substring(0, 10) : ''}
                          onChange={(e) => handleExperienceChange(index, 'to', e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required={!exp.current}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Description
                    </label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addExperience}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add Experience
              </button>
            </div>
          )}
          
          {/* Education Tab */}
          {activeTab === 'education' && (
            <div>
              {formData.education.map((edu, index) => (
                <div key={index} className="mb-8 p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Education #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Degree
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        From
                      </label>
                      <input
                        type="date"
                        value={edu.from ? edu.from.substring(0, 10) : ''}
                        onChange={(e) => handleEducationChange(index, 'from', e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`current-edu-${index}`}
                        checked={edu.current}
                        onChange={(e) => handleEducationChange(index, 'current', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={`current-edu-${index}`} className="text-gray-700 text-sm font-bold">
                        I'm currently studying here
                      </label>
                    </div>
                    
                    {!edu.current && (
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          To
                        </label>
                        <input
                          type="date"
                          value={edu.to ? edu.to.substring(0, 10) : ''}
                          onChange={(e) => handleEducationChange(index, 'to', e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required={!edu.current}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Description
                    </label>
                    <textarea
                      value={edu.description}
                      onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addEducation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add Education
              </button>
            </div>
          )}
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;