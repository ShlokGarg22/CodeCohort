import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import ProblemCarousel from './components/ProblemCarousel'
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

// Home component (original content)
const Home = () => {
  const handleJoinTeam = (problemId) => {
    console.log(`Joining team for problem ${problemId}`)
    // Navigate to problem page - you can implement routing here
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 relative z-10">
      <div className="mb-6 fade-in">
        <h2 className="text-2xl font-bold text-white mb-1">Available Problems</h2>
        <p className="text-slate-300 text-sm">Find problems that match your skills and join a team to solve them together.</p>
      </div>

      <div className="fade-in" style={{ animationDelay: '0.2s' }}>
        <ProblemCarousel 
          problemsData={problemsData}
          onJoinTeam={handleJoinTeam}
        />
      </div>
    </main>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen animated-bg relative overflow-hidden">
          {/* Floating Particles */}
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          
          <Navbar />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Footer */}
          <footer className="bg-slate-800/80 backdrop-blur-sm border-t border-slate-700 mt-16 relative z-10 fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center">
                <p className="text-slate-300 text-sm">
                  Made by{' '}
                  <span className="font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Shlok Garg
                  </span>
                  {' '}and{' '}
                  <span className="font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Shashank Rai
                  </span>
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  © 2025 CodeCohort. Building the future of developer collaboration.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
