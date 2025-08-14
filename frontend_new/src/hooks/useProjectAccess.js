import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { teamService } from '../services/teamService';
import { problemService } from '../services/problemService';

/**
 * Hook to check if current user has access to a project
 * @param {string} projectId - The project ID to check access for
 * @returns {object} - Access permissions and loading state
 */
export const useProjectAccess = (projectId) => {
  const { user } = useAuth();
  const [access, setAccess] = useState({
    loading: true,
    hasAccess: false,
    isCreator: false,
    isTeamMember: false,
    isAdmin: false,
    memberRole: null,
    project: null,
    canAccessRepository: false,
    canManageTeam: false,
    canEditTasks: false,
    canViewVersionHistory: false,
    error: null
  });

  useEffect(() => {
    checkAccess();
  }, [projectId, user]);

  const checkAccess = async () => {
    if (!projectId || !user) {
      setAccess(prev => ({ ...prev, loading: false, hasAccess: false }));
      return;
    }

    try {
      setAccess(prev => ({ ...prev, loading: true, error: null }));

      // Fetch project details
      const projectResponse = await problemService.getProblemById(projectId);
      const project = projectResponse.data;

      // Check user roles
      const isCreator = project.createdBy?._id === user._id || project.createdBy === user._id;
      const isAdmin = user.role === 'admin';
      
      // Check if user is a team member
      const teamMember = project.teamMembers?.find(member => 
        (member.user?._id || member.user) === user._id
      );
      const isTeamMember = !!teamMember;
      const memberRole = teamMember?.role || null;

      // Determine access permissions
      const hasAccess = isCreator || isAdmin || isTeamMember;
      const canAccessRepository = (isCreator || isAdmin || isTeamMember) && 
                                   project.githubRepository?.isLocked;
      const canManageTeam = isCreator || isAdmin;
      const canEditTasks = isCreator || isAdmin || (isTeamMember && memberRole === 'lead');
      const canViewVersionHistory = hasAccess && project.githubRepository?.isLocked;

      setAccess({
        loading: false,
        hasAccess,
        isCreator,
        isTeamMember,
        isAdmin,
        memberRole,
        project,
        canAccessRepository,
        canManageTeam,
        canEditTasks,
        canViewVersionHistory,
        error: null
      });

    } catch (error) {
      console.error('Error checking project access:', error);
      setAccess(prev => ({
        ...prev,
        loading: false,
        hasAccess: false,
        error: error.message || 'Failed to check access permissions'
      }));
    }
  };

  return { ...access, refetch: checkAccess };
};

/**
 * Hook to get user's accessible projects (as team member)
 * @returns {object} - User's projects and loading state
 */
export const useUserProjects = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    loading: true,
    projects: [],
    error: null
  });

  useEffect(() => {
    fetchUserProjects();
  }, [user]);

  const fetchUserProjects = async () => {
    if (!user || user.role !== 'user') {
      setData({ loading: false, projects: [], error: null });
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Get all projects and filter for user's team memberships
      const response = await problemService.getAllProblems();
      const allProjects = response.data || [];
      
      // Filter projects where user is a team member
      const userProjects = allProjects.filter(project => 
        project.teamMembers?.some(member => 
          (member.user?._id || member.user) === user._id
        )
      );

      setData({
        loading: false,
        projects: userProjects,
        error: null
      });

    } catch (error) {
      console.error('Error fetching user projects:', error);
      setData({
        loading: false,
        projects: [],
        error: error.message || 'Failed to fetch projects'
      });
    }
  };

  return { ...data, refetch: fetchUserProjects };
};

/**
 * Hook to check repository access for team members
 * @param {string} projectId - The project ID
 * @returns {object} - Repository access and data
 */
export const useRepositoryAccess = (projectId) => {
  const { user } = useAuth();
  const [repoAccess, setRepoAccess] = useState({
    loading: true,
    hasAccess: false,
    repository: null,
    error: null
  });

  useEffect(() => {
    checkRepositoryAccess();
  }, [projectId, user]);

  const checkRepositoryAccess = async () => {
    if (!projectId || !user) {
      setRepoAccess({ loading: false, hasAccess: false, repository: null, error: null });
      return;
    }

    try {
      setRepoAccess(prev => ({ ...prev, loading: true, error: null }));

      // Get repository info
      const repoResponse = await problemService.getGitHubRepository(projectId);
      const repository = repoResponse.data;

      // Check if repository is locked (accessible to team members)
      const hasAccess = repository?.isLocked && repository?.url;

      setRepoAccess({
        loading: false,
        hasAccess,
        repository,
        error: null
      });

    } catch (error) {
      console.error('Error checking repository access:', error);
      setRepoAccess({
        loading: false,
        hasAccess: false,
        repository: null,
        error: error.message || 'Failed to check repository access'
      });
    }
  };

  return { ...repoAccess, refetch: checkRepositoryAccess };
};
