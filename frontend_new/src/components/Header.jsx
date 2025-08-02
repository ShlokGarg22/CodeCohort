import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { User, LogOut, Plus, Users, ChevronDown, Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { problemService } from '../services/problemService';
import NotificationPanel from './NotificationPanel';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { joinRequests, notifications } = useSocket();
  const navigate = useNavigate();
  const [userProjects, setUserProjects] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const isApprovedCreator = user?.role === 'creator' && user?.creatorStatus === 'approved';
  const isDeveloper = user?.role === 'user';

  // Calculate total notification count
  const totalNotifications = joinRequests.length + notifications.length;

  // Fetch user's joined projects for team navigation
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (isAuthenticated && isDeveloper) {
        try {
          const response = await problemService.getAllProblems();
          const allProjects = response.data || [];
          
          // Filter projects where user is a team member
          const joinedProjects = allProjects.filter(project => 
            project.teamMembers?.some(member => 
              (member.user?._id || member._id) === (user?._id || user?.id)
            )
          );
          
          setUserProjects(joinedProjects);
        } catch (error) {
          console.error('Error fetching user projects:', error);
        }
      }
    };

    fetchUserProjects();
  }, [isAuthenticated, isDeveloper, user?.id]);

  const handleGoToProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <header className="w-full px-6 py-4 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-2xl font-bold text-gray-900 tracking-tight hover:text-gray-700">
            CodeCohort
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Welcome, {user?.username}</span>
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2"
                >
                  <Bell className="h-4 w-4" />
                  {totalNotifications > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600 text-white"
                    >
                      {totalNotifications > 9 ? '9+' : totalNotifications}
                    </Badge>
                  )}
                </Button>
              </div>
              
              {/* Team Navigation for Developers */}
              {isDeveloper && userProjects.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      My Teams ({userProjects.length})
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50">
                      Your Projects
                    </div>
                    <DropdownMenuSeparator />
                    {userProjects.map((project) => (
                      <DropdownMenuItem 
                        key={project._id}
                        onClick={() => handleGoToProject(project._id)}
                        className="flex flex-col items-start py-2"
                      >
                        <span className="font-medium">{project.title}</span>
                        <span className="text-xs text-gray-500 truncate">
                          {project.teamMembers?.length || 0} members • {project.difficulty || 'Medium'}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {isApprovedCreator && (
                <Link to="/create-problem">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Project
                  </Button>
                </Link>
              )}
              
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <div className="text-gray-500 text-sm font-medium tracking-wide">
                Collaborate. Code. Create.
              </div>
              <div className="flex items-center space-x-2">
                <Link to="/signin">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
};

export default Header;