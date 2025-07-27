import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Navbar = () => {
  const [isTeamsDropdownOpen, setIsTeamsDropdownOpen] = useState(false)
  const { logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const userTeams = [
    { id: 1, name: "Team Alpha" },
    { id: 2, name: "Team Beta" },
    { id: 3, name: "Team Gamma" }
  ]

  const handleProfileClick = () => {
    navigate('/profile')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const toggleTeamsDropdown = () => {
    setIsTeamsDropdownOpen(!isTeamsDropdownOpen)
  }

  const handleTeamClick = (teamId) => {
    console.log(`Navigate to team ${teamId}`)
    setIsTeamsDropdownOpen(false)
    // Add navigation logic here
  }

  return (
    <nav className="bg-slate-800/95 backdrop-blur-sm border-b border-cyan-400/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-slate-300 bg-clip-text text-transparent hover:from-cyan-300 hover:to-slate-200 transition-all duration-200 cursor-pointer"
            >
              CodeCohort
            </Link>
          </div>
          
          {/* Navigation Items */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                {/* My Teams Dropdown */}
                <div className="relative">
                  <button 
                    className="text-slate-300 hover:text-cyan-400 font-medium flex items-center transition-colors"
                    onClick={toggleTeamsDropdown}
                    onMouseEnter={() => setIsTeamsDropdownOpen(true)}
                  >
                    My Teams
                    <svg 
                      className={`ml-1 h-4 w-4 transition-transform ${isTeamsDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isTeamsDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-xl border border-slate-600 z-10"
                      onMouseLeave={() => setIsTeamsDropdownOpen(false)}
                    >
                      <div className="py-1">
                        {userTeams.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => handleTeamClick(team.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                          >
                            {team.name}
                          </button>
                        ))}
                        {userTeams.length === 0 && (
                          <div className="px-4 py-2 text-sm text-slate-400">
                            No teams joined yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Dashboard Button */}
                <Link 
                  to="/dashboard"
                  className="text-slate-300 hover:text-cyan-400 font-medium flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2" />
                  </svg>
                  Dashboard
                </Link>
                
                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  {/* Profile Icon */}
                  <button 
                    className="text-slate-300 hover:text-cyan-400 transition-colors" 
                    onClick={handleProfileClick}
                    title="Profile"
                  >
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Authentication Buttons for Non-logged in users */}
                <Link
                  to="/signin"
                  className="text-slate-300 hover:text-cyan-400 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-cyan-600 text-slate-900 px-4 py-2 rounded-md font-medium hover:bg-cyan-500 transition-colors shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
