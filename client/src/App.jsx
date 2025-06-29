import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pricing from './pages/Pricing'
import VideoGenerator from './pages/VideoGenerator'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'

// Component to handle auth redirects
const AuthRedirectHandler = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check if we have an access token in the URL (from auth redirect)
    const hashParams = new URLSearchParams(location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    
    if (accessToken) {
      // Clear the hash and redirect to dashboard
      window.history.replaceState(null, '', window.location.pathname)
      navigate('/dashboard', { replace: true })
    }
  }, [location, navigate])

  return null
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <div className="min-h-screen bg-gray-50">
            <AuthRedirectHandler />
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/generate" 
                  element={
                    <ProtectedRoute>
                      <VideoGenerator />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Toaster position="top-right" />
          </div>
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  )
}

export default App