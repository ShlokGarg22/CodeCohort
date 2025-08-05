import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import AdminDashboard from './AdminDashboard';
import CreatorDashboard from './CreatorDashboard';
import UserDashboard from './UserDashboard';
import { 
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Navigation will be handled by the auth context
  };

  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'creator':
        return <CreatorDashboard />;
      case 'user':
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                CodeCohort
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.role === 'admin' ? 'Admin Dashboard' : 
                 user?.role === 'creator' ? 'Creator Dashboard' : 
                 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome back, {user?.fullName || user?.username}!
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default Dashboard;
