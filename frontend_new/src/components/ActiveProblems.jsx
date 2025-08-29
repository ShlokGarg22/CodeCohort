import React, { useState, useMemo, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, Rocket, RefreshCw } from 'lucide-react';
import ProjectCard from './ProjectCard';
import JoinTeamModal from './JoinTeamModal';
import { problemService } from '../services/problemService';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'sonner';

const ActiveProblems = () => {
  const { isAuthenticated, user } = useAuth();
  const { sendJoinRequest } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [userJoinedProjects, setUserJoinedProjects] = useState(new Set());

  // Fetch problems from API
  useEffect(() => {
    fetchProblems();
  }, []);

  // Get user's joined projects
  useEffect(() => {
    if (isAuthenticated && user) {
      const joinedProjectIds = user.joinedProjects?.map(p => p._id) || [];
      setUserJoinedProjects(new Set(joinedProjectIds));
    }
  }, [isAuthenticated, user]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      // Request more problems for home page - use a high limit to show all active problems
      const response = await problemService.getProblems({ limit: 100 });
      if (response.success) {
        setProblems(response.problems || []);
      } else {
        setError('Failed to load projects');
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories and difficulties from fetched problems
  const categories = [...new Set(problems.map(p => p.category))];
  const difficulties = [...new Set(problems.map(p => p.difficulty))];

  // Filter projects
  const filteredProjects = useMemo(() => {
    return problems.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.techStack.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDifficulty = selectedDifficulty === 'all' || project.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
      
      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [problems, searchTerm, selectedDifficulty, selectedCategory]);

  const handleJoinTeam = (project) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to join a project');
      return;
    }

    if (userJoinedProjects.size >= 3) {
      toast.error('You can only join a maximum of 3 projects');
      return;
    }

    setSelectedProject(project);
    setIsJoinModalOpen(true);
  };

  const handleJoinSubmit = async (projectId, message) => {
    try {
      if (!selectedProject) return;

      // Send real-time join request via Socket.io
      sendJoinRequest(
        projectId,
        selectedProject.createdBy._id,
        {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          profileImage: user.profileImage
        },
        message
      );

      toast.success('Join request sent successfully! The creator will review your request.');
      setIsJoinModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error sending join request:', error);
      toast.error('Failed to send join request');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDifficulty('all');
    setSelectedCategory('all');
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Rocket className="text-gray-700" size={32} />
          <h2 className="text-3xl font-bold text-gray-900">Active Problems</h2>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Join a team and work on exciting coding projects together. Build your portfolio 
          while collaborating with fellow developers.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search projects, tech stack..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Difficulty Filter */}
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-full md:w-40 h-11">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {difficulties.map(difficulty => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-40 h-11">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters & Refresh */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="h-11 px-4"
            >
              <Filter size={16} className="mr-2" />
              Clear
            </Button>
            <Button 
              variant="outline" 
              onClick={fetchProblems}
              disabled={loading}
              className="h-11 px-4"
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-500">
          Showing {filteredProjects.length} of {problems.length} projects
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw size={48} className="mx-auto text-gray-400 animate-spin mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading projects...</h3>
          <p className="text-gray-500">Please wait while we fetch the latest projects</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load projects</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchProblems} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Try again
          </Button>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project._id}
              project={project}
              onJoinTeam={handleJoinTeam}
              isJoined={userJoinedProjects.has(project._id)}
            />
          ))}
        </div>
      )}

      {/* Join Team Modal */}
      <JoinTeamModal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleJoinSubmit}
        project={selectedProject}
      />

      {/* Empty State */}
      {!loading && !error && filteredProjects.length === 0 && problems.length > 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear all filters
          </Button>
        </div>
      )}

      {/* No Projects Created Yet */}
      {!loading && !error && problems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Rocket size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">
            Be the first to create a project challenge for the community!
          </p>
        </div>
      )}
    </section>
  );
};

export default ActiveProblems;