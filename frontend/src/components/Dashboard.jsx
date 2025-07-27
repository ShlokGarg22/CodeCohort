import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-600/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-600/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-600/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-xl shadow-2xl border-b border-slate-700/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="transform transition-all duration-300">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-400 mt-1">Welcome to your coding sanctuary</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm transform transition-all duration-300 hover:scale-105">
                <p className="text-slate-400">Welcome back,</p>
                <p className="font-medium text-white text-lg">{user?.fullName}</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse-glow">
                  <span className="text-white text-lg font-bold">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="bg-slate-800/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-slate-700/50 transform transition-all duration-700 hover:scale-105 hover:shadow-purple-500/25">
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Your Profile</h3>
              </div>
              <dl className="space-y-4">
                <div className="transform transition-all duration-300 hover:translate-x-2">
                  <dt className="text-sm font-medium text-slate-400">Full Name</dt>
                  <dd className="text-lg text-white font-medium">{user?.fullName}</dd>
                </div>
                <div className="transform transition-all duration-300 hover:translate-x-2">
                  <dt className="text-sm font-medium text-slate-400">Username</dt>
                  <dd className="text-lg text-purple-400 font-medium">@{user?.username}</dd>
                </div>
                <div className="transform transition-all duration-300 hover:translate-x-2">
                  <dt className="text-sm font-medium text-slate-400">Email</dt>
                  <dd className="text-lg text-white font-medium">{user?.email}</dd>
                </div>
                <div className="transform transition-all duration-300 hover:translate-x-2">
                  <dt className="text-sm font-medium text-slate-400">Role</dt>
                  <dd className="text-lg text-blue-400 font-medium capitalize">{user?.role}</dd>
                </div>
                <div className="transform transition-all duration-300 hover:translate-x-2">
                  <dt className="text-sm font-medium text-slate-400">Member Since</dt>
                  <dd className="text-lg text-white font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-slate-800/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-slate-700/50 transform transition-all duration-700 hover:scale-105 hover:shadow-purple-500/25">
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Your Stats</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg transform transition-all duration-300 hover:bg-slate-700/70">
                  <span className="text-slate-300 font-medium">Projects Joined</span>
                  <span className="text-2xl font-bold text-purple-400">0</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg transform transition-all duration-300 hover:bg-slate-700/70">
                  <span className="text-slate-300 font-medium">Projects Created</span>
                  <span className="text-2xl font-bold text-blue-400">0</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg transform transition-all duration-300 hover:bg-slate-700/70">
                  <span className="text-slate-300 font-medium">Contributions</span>
                  <span className="text-2xl font-bold text-green-400">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-slate-800/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-slate-700/50 transform transition-all duration-700 hover:scale-105 hover:shadow-purple-500/25">
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
              </div>
              <div className="space-y-4">
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
                  Browse Projects
                </button>
                <button className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
                  Create New Project
                </button>
                <button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-lg text-sm font-medium hover:from-slate-700 hover:to-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transform transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <div className="bg-slate-800/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-slate-700/50 transform transition-all duration-700 hover:scale-105 hover:shadow-purple-500/25">
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
              </div>
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg className="mx-auto h-16 w-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-xl text-slate-400 font-medium">No recent activity to display</p>
                <p className="text-slate-500 mt-3 text-lg">Start by joining or creating a project!</p>
                <div className="mt-8">
                  <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
