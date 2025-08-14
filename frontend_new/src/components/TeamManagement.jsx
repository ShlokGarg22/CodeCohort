import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { 
  Users, 
  Crown, 
  User, 
  UserMinus, 
  Settings, 
  Calendar,
  MoreVertical,
  Shield,
  Star
} from 'lucide-react';
import { teamService } from '../services/teamService';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TeamManagement = ({ projects, onRefresh }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      fetchTeamMembers();
    }
  }, [selectedProject]);

  const fetchTeamMembers = async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(true);
      const response = await teamService.getTeamMembers(selectedProject);
      setTeamMembers([
        // Creator first
        {
          user: response.data.creator,
          role: 'creator',
          joinedAt: null,
          isCreator: true
        },
        // Then team members
        ...response.data.members
      ]);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return;
    }

    try {
      await teamService.removeTeamMember(selectedProject, userId);
      toast.success(`${memberName} has been removed from the team`);
      fetchTeamMembers();
      onRefresh?.();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error(error.message || 'Failed to remove team member');
    }
  };

  const handleUpdateRole = async (userId, newRole, memberName) => {
    try {
      await teamService.updateMemberRole(selectedProject, userId, newRole);
      toast.success(`${memberName}'s role has been updated to ${newRole}`);
      fetchTeamMembers();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error(error.message || 'Failed to update member role');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'creator':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'lead':
        return <Star className="h-4 w-4 text-blue-500" />;
      case 'developer':
        return <User className="h-4 w-4 text-gray-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'creator':
        return 'bg-yellow-100 text-yellow-800';
      case 'lead':
        return 'bg-blue-100 text-blue-800';
      case 'developer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </CardTitle>
          <CardDescription>
            Manage your project teams and members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              Create your first project to start managing teams.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Management
        </CardTitle>
        <CardDescription>
          Manage your project teams and members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Select Project to Manage
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((project) => (
              <Button
                key={project._id}
                variant={selectedProject === project._id ? 'default' : 'outline'}
                className="p-3 h-auto text-left justify-start"
                onClick={() => setSelectedProject(project._id)}
              >
                <div>
                  <div className="font-medium">{project.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {project.teamMembers?.length + 1 || 1} members • {project.difficulty || 'Medium'}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Team Members */}
        {selectedProject && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">Team Members</h3>
              <Badge variant="secondary">
                {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
              </Badge>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="text-lg">Loading team members...</div>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div 
                    key={member.user._id} 
                    className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user.profileImage} alt={member.user.fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {member.user.fullName?.charAt(0) || member.user.username?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.user.fullName || member.user.username}</span>
                          {getRoleIcon(member.role)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Badge className={getRoleBadgeColor(member.role)}>
                            {member.role}
                          </Badge>
                          {member.joinedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                            </span>
                          )}
                          {member.isCreator && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Project Creator
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions - Only for non-creator members */}
                    {!member.isCreator && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleUpdateRole(member.user._id, 'lead', member.user.fullName)}
                            disabled={member.role === 'lead'}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Make Team Lead
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateRole(member.user._id, 'developer', member.user.fullName)}
                            disabled={member.role === 'developer'}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Make Developer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRemoveMember(member.user._id, member.user.fullName)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove from Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamManagement;
