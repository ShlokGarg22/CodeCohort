import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import UserProfile from './components/UserProfile'
import InteractiveGlobe from './components/InteractiveGlobe'
import UbuntuDesktop from './components/UbuntuDesktop'
import Teams from './components/Teams'
import SignUp from './components/auth/SignUp'
import SignIn from './components/auth/SignIn'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

const problemsData = [
  {
    id: 1,
    title: "E-commerce Analytics Dashboard",
    description: "Build a comprehensive analytics dashboard for tracking e-commerce metrics, user behavior, and sales performance with real-time data visualization.",
    techStack: ["React", "Node.js", "MongoDB", "Chart.js"],
    currentMembers: 3,
    totalMembers: 5
  },
  {
    id: 2,
    title: "AI-Powered Code Review Tool",
    description: "Develop an intelligent code review system that uses machine learning to detect bugs, suggest improvements, and enforce coding standards.",
    techStack: ["Python", "TensorFlow", "FastAPI", "Docker"],
    currentMembers: 2,
    totalMembers: 4
  },
  {
    id: 3,
    title: "Real-time Collaboration Platform",
    description: "Create a real-time collaboration platform similar to Figma but for developers, allowing simultaneous code editing and project management.",
    techStack: ["Vue.js", "Socket.io", "Express", "Redis"],
    currentMembers: 1,
    totalMembers: 6
  },
  {
    id: 4,
    title: "Mobile App Performance Monitor",
    description: "Build a comprehensive monitoring solution for mobile applications that tracks performance metrics, crash reports, and user analytics.",
    techStack: ["React Native", "Firebase", "AWS", "GraphQL"],
    currentMembers: 4,
    totalMembers: 5
  },
  {
    id: 5,
    title: "Blockchain-based Voting System",
    description: "Design and implement a secure, transparent voting system using blockchain technology for organizational and governmental elections.",
    techStack: ["Solidity", "Web3.js", "Ethereum", "IPFS"],
    currentMembers: 2,
    totalMembers: 6
  },
  {
    id: 6,
    title: "IoT Smart Home Controller",
    description: "Develop an intelligent home automation system that can control and monitor IoT devices with machine learning-based optimization.",
    techStack: ["Python", "Raspberry Pi", "MQTT", "TensorFlow"],
    currentMembers: 3,
    totalMembers: 4
  }
]

// Home component - now uses Ubuntu desktop layout
const Home = () => {
  return <UbuntuDesktop />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <UbuntuDesktop />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UbuntuDesktop />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teams" 
            element={
              <ProtectedRoute>
                <UbuntuDesktop />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App