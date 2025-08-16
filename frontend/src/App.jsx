import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ClerkSignIn from './components/auth/ClerkSignIn';
import ClerkSignUp from './components/auth/ClerkSignUp';
import Onboarding from './components/auth/Onboarding';
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/profile/Profile';
import EditProfile from './components/profile/EditProfile';
import UserProfile from './components/users/UserProfile';
import UserDirectory from './components/users/UserDirectory';
import Connections from './components/connections/Connections';
import ConnectionRequests from './components/connections/ConnectionRequests';
import Chat from './components/chat/Chat';
import Events from './components/events/Events';
import Jobs from './components/jobs/Jobs';
import NotFound from './components/layout/NotFound';

// Context
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Set default axios base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }} />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Private routes */}
                <Route path="/" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/profile/edit" element={
                  <PrivateRoute>
                    <EditProfile />
                  </PrivateRoute>
                } />
                <Route path="/users" element={
                  <PrivateRoute>
                    <UserDirectory />
                  </PrivateRoute>
                } />
                <Route path="/users/:id" element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                } />
                <Route path="/connections" element={
                  <PrivateRoute>
                    <Connections />
                  </PrivateRoute>
                } />
                <Route path="/connection-requests" element={
                  <PrivateRoute>
                    <ConnectionRequests />
                  </PrivateRoute>
                } />
                <Route path="/chat" element={
                  <PrivateRoute>
                    <Chat />
                  </PrivateRoute>
                } />
                <Route path="/chat/:userId" element={
                  <PrivateRoute>
                    <Chat />
                  </PrivateRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
