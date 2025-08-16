import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await axios.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const res = await axios.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Registration successful!');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Login successful!');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const res = await axios.put('/auth/profile', profileData);
      setUser(res.data);
      toast.success('Profile updated successfully');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Update profile picture
  const updateProfilePicture = async (formData) => {
    try {
      setError(null);
      const res = await axios.put('/auth/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(res.data);
      toast.success('Profile picture updated successfully');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile picture update failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const res = await axios.put('/auth/password', { currentPassword, newPassword });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        updateProfilePicture,
        changePassword,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;