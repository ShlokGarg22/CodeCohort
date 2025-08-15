/**
 * Enhanced Version History Page Component
 * Advanced Git analytics with contributors, branches, and code frequency
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjectAccess } from '../hooks/useProjectAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Area, 
  AreaChart 
} from 'recharts';
import { 
  ArrowLeft, 
  GitBranch, 
  Clock, 
  User, 
  FileText, 
  GitCommit,
  GitCompare,
  ExternalLink,
  Loader2,
  RefreshCw,
  Calendar,
  Hash,
  Shield,
  Lock,
  Users,
  Activity,
  TrendingUp,
  Star,
  Eye,
  GitFork,
  Code,
  BarChart3,
  PieChart,
  GitPullRequest,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  FileCode,
  Plus,
  Minus
} from 'lucide-react';
import { githubService } from '../services/githubService';
import { getCommitAuthorDisplay, getCommitMessage, getCommitDate } from '../utils/commitUtils';
import CommitTimeline from './VersionHistory/CommitTimeline';
import CommitComparison from './VersionHistory/CommitComparison';
import { toast } from 'sonner';

const VersionHistory = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use project access hook
  const {
    loading: accessLoading,
    hasAccess,
    canViewVersionHistory,
    project,
    isCreator,
    memberRole,
    error: accessError
  } = useProjectAccess(projectId);
  
  // Component state
  const [loading, setLoading] = useState(true);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [commits, setCommits] = useState([]);
  const [repoData, setRepoData] = useState(null);
  const [contributorsData, setContributorsData] = useState([]);
  const [branchesData, setBranchesData] = useState([]);
  const [codeFrequency, setCodeFrequency] = useState([]);
  const [repoStats, setRepoStats] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // View mode state
  const [viewMode, setViewMode] = useState('timeline');
  const [selectedCommits, setSelectedCommits] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);
  
  // Get active tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    setActiveTab(tab);
  }, [searchParams]);

  /**
   * Initialize component - fetch project data and analytics
   */
  useEffect(() => {
    if (!accessLoading) {
      if (!hasAccess || !canViewVersionHistory) {
        setError('You do not have access to view version history for this project');
        setLoading(false);
      } else if (accessError) {
        setError(accessError);
        setLoading(false);
      } else if (project) {
        initializeVersionHistory();
      }
    }
  }, [accessLoading, hasAccess, canViewVersionHistory, accessError, project]);

  /**
   * Initialize version history and analytics data
   */
  const initializeVersionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsAnimating(true);

      // Check if project has a GitHub repository
      if (!project.githubRepository?.url) {
        setError(`No GitHub repository linked to this project. Please link a GitHub repository first.`);
        setLoading(false);
        return;
      }

      // Check if repository is accessible
      if (!project.githubRepository?.isLocked) {
        setError(`Repository access is not enabled for this project. Repository Status:
        - URL: ${project.githubRepository?.url || 'Not set'}
        - Locked: ${project.githubRepository?.isLocked ? 'Yes' : 'No'}
        - Owner: ${project.githubRepository?.owner || 'Not set'}
        - Name: ${project.githubRepository?.name || 'Not set'}
        
        The repository must be locked by the project creator to enable version history viewing.`);
        setLoading(false);
        return;
      }

      // Fetch all repository data
      await Promise.all([
        fetchRepositoryData(project.githubRepository.url),
        fetchCommits(project.githubRepository.url),
        fetchContributors(project.githubRepository.url),
        fetchBranches(project.githubRepository.url),
        fetchCodeFrequency(project.githubRepository.url),
        fetchRepoStats(project.githubRepository.url)
      ]);

      // Trigger stats animation
      setTimeout(() => {
        setStatsLoaded(true);
      }, 500);

    } catch (err) {
      console.error('Failed to initialize version history:', err);
      setError('Failed to load version history data');
    } finally {
      setLoading(false);
      setIsAnimating(false);
    }
  };

  /**
   * Fetch repository metadata
   */
  const fetchRepositoryData = async (repoUrl) => {
    try {
      const validation = await githubService.validateRepository(repoUrl);
      if (validation.isValid) {
        setRepoData(validation.repoData);
      } else {
        throw new Error(validation.error);
      }
    } catch (err) {
      console.error('Failed to fetch repository data:', err);
      setError(`Failed to access GitHub repository: ${err.message}`);
    }
  };

  /**
   * Fetch commit history
   */
  const fetchCommits = async (repoUrl, page = 1, append = false) => {
    try {
      setCommitsLoading(true);
      
      const result = await githubService.getCommitHistory(repoUrl, page, 20);
      
      if (append) {
        setCommits(prev => [...prev, ...result.commits]);
      } else {
        setCommits(result.commits);
      }
      
      setHasMore(result.hasMore);
      setCurrentPage(page);
      
    } catch (err) {
      console.error('Failed to fetch commits:', err);
      toast.error(`Failed to load commits: ${err.message}`);
    } finally {
      setCommitsLoading(false);
    }
  };

  /**
   * Fetch contributors data
   */
  const fetchContributors = async (repoUrl) => {
    try {
      const contributors = await githubService.getContributors(repoUrl);
      setContributorsData(contributors);
    } catch (err) {
      console.error('Failed to fetch contributors:', err);
    }
  };

  /**
   * Fetch branches data
   */
  const fetchBranches = async (repoUrl) => {
    try {
      const branches = await githubService.getBranches(repoUrl);
      setBranchesData(branches);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  /**
   * Fetch code frequency data
   */
  const fetchCodeFrequency = async (repoUrl) => {
    try {
      const frequency = await githubService.getCodeFrequency(repoUrl);
      setCodeFrequency(frequency);
    } catch (err) {
      console.error('Failed to fetch code frequency:', err);
    }
  };

  /**
   * Fetch repository statistics
   */
  const fetchRepoStats = async (repoUrl) => {
    try {
      const stats = await githubService.getRepoStats(repoUrl);
      setRepoStats(stats);
    } catch (err) {
      console.error('Failed to fetch repo stats:', err);
    }
  };

  /**
   * Switch tabs
   */
  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  /**
   * Load more commits (pagination)
   */
  const loadMoreCommits = () => {
    if (project?.githubRepository?.url && hasMore && !commitsLoading) {
      fetchCommits(project.githubRepository.url, currentPage + 1, true);
    }
  };

  /**
   * Refresh all data
   */
  const refreshData = () => {
    initializeVersionHistory();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <div className="absolute inset-0 h-12 w-12 animate-ping mx-auto border-4 border-blue-300 rounded-full opacity-30"></div>
          </div>
          <p className="text-gray-700 text-lg font-medium">Loading version analytics...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching repository data and statistics</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            </div>
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
            <div className="mt-6 flex gap-3">
              <Button 
                onClick={() => navigate(-1)} 
                variant="outline" 
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button 
                onClick={refreshData} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="p-3 hover:bg-blue-100 rounded-full transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Version Analytics
                </h1>
                <p className="text-gray-600 font-medium">
                  {project?.title}
                </p>
              </div>
            </div>
            
            {/* Enhanced Status Badges */}
            <div className="flex items-center gap-4">
              <Badge className={`px-3 py-1 ${
                isCreator ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                memberRole === 'lead' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              } animate-pulse`}>
                <div className="flex items-center gap-2">
                  {isCreator ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  {isCreator ? 'Creator' : memberRole === 'lead' ? 'Team Lead' : 'Developer'}
                </div>
              </Badge>
              
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
                <Lock className="h-4 w-4 mr-2" />
                Full Access
              </Badge>

              <Button 
                onClick={refreshData}
                variant="outline"
                size="sm"
                className="border-blue-200 hover:bg-blue-50 transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Repository Info Banner */}
      {repoData && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                  <GitBranch className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {repoData.fullName}
                  </h2>
                  <p className="text-blue-100 text-lg">
                    {repoData.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span className="text-sm">{repoData.stargazers_count || 0} stars</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitFork className="h-4 w-4" />
                      <span className="text-sm">{repoData.forks_count || 0} forks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">{repoData.watchers_count || 0} watchers</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-white/20 text-white px-3 py-1">
                  <Code className="h-4 w-4 mr-2" />
                  {repoData.language || 'Multiple Languages'}
                </Badge>
                <Button
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-200"
                  onClick={() => window.open(`https://github.com/${repoData.fullName}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on GitHub
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={switchTab} className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200/50">
            <TabsList className="grid w-full grid-cols-5 bg-transparent">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-200"
              >
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="commits"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-200"
              >
                <GitCommit className="h-4 w-4 mr-2" />
                Commits
              </TabsTrigger>
              <TabsTrigger 
                value="contributors"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-200"
              >
                <Users className="h-4 w-4 mr-2" />
                Contributors
              </TabsTrigger>
              <TabsTrigger 
                value="branches"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-200"
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Branches
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-200"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewSection 
              repoStats={repoStats}
              contributorsData={contributorsData.slice(0, 5)}
              recentCommits={commits.slice(0, 5)}
              statsLoaded={statsLoaded}
            />
          </TabsContent>

          {/* Commits Tab */}
          <TabsContent value="commits" className="space-y-6">
            <CommitsSection 
              commits={commits}
              loading={commitsLoading}
              hasMore={hasMore}
              onLoadMore={loadMoreCommits}
              onRefresh={refreshData}
              repoData={repoData}
            />
          </TabsContent>

          {/* Contributors Tab */}
          <TabsContent value="contributors" className="space-y-6">
            <ContributorsSection contributors={contributorsData} />
          </TabsContent>

          {/* Branches Tab */}
          <TabsContent value="branches" className="space-y-6">
            <BranchesSection branches={branchesData} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsSection 
              codeFrequency={codeFrequency}
              contributorsData={contributorsData}
              commits={commits}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Overview Section Component
const OverviewSection = ({ repoStats, contributorsData, recentCommits, statsLoaded }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Quick Stats Cards */}
    <StatsCard 
      title="Total Commits" 
      value={repoStats?.totalCommits || 0}
      icon={GitCommit}
      color="blue"
      animate={statsLoaded}
      delay={0}
    />
    <StatsCard 
      title="Contributors" 
      value={contributorsData?.length || 0}
      icon={Users}
      color="green"
      animate={statsLoaded}
      delay={100}
    />
    <StatsCard 
      title="Last Updated" 
      value={repoStats?.lastUpdated ? new Date(repoStats.lastUpdated).toLocaleDateString() : 'N/A'}
      icon={Clock}
      color="purple"
      animate={statsLoaded}
      delay={200}
      isDate={true}
    />
    
    {/* Recent Activity */}
    <div className="col-span-full">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentCommits.map((commit, index) => (
              <div key={commit.sha} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{getCommitMessage(commit)}</p>
                  <p className="text-xs text-gray-500">
                    by {getCommitAuthorDisplay(commit)} • {getCommitDate(commit).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Stats Card Component with Animation
const StatsCard = ({ title, value, icon: Icon, color, animate, delay, isDate = false }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (animate && !isDate) {
      const timer = setTimeout(() => {
        const target = typeof value === 'number' ? value : 0;
        let current = 0;
        const increment = target / 30;
        const interval = setInterval(() => {
          current += increment;
          if (current >= target) {
            setDisplayValue(target);
            clearInterval(interval);
          } else {
            setDisplayValue(Math.floor(current));
          }
        }, 50);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [animate, value, delay, isDate]);

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300 ${animate ? 'animate-fadeInUp' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">
              {isDate ? value : displayValue.toLocaleString()}
            </p>
          </div>
          <Icon className="h-8 w-8 text-white/80" />
        </div>
      </CardContent>
    </Card>
  );
};

// Commits Section Component
const CommitsSection = ({ commits, loading, hasMore, onLoadMore, onRefresh, repoData }) => (
  <div className="space-y-4">
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5 text-blue-600" />
            Commit History
          </CardTitle>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CommitTimeline
          commits={commits}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          onRefresh={onRefresh}
          repoData={repoData}
        />
      </CardContent>
    </Card>
  </div>
);

// Contributors Section Component
const ContributorsSection = ({ contributors }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {contributors.map((contributor, index) => (
      <Card key={contributor.login} className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg transform hover:scale-105 transition-all duration-300 animate-fadeInUp`} style={{ animationDelay: `${index * 100}ms` }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <img 
              src={contributor.avatar_url} 
              alt={contributor.login}
              className="w-12 h-12 rounded-full border-2 border-blue-200"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{contributor.login}</h3>
              <p className="text-sm text-gray-600">{contributor.contributions} contributions</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min((contributor.contributions / Math.max(...contributors.map(c => c.contributions))) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Branches Section Component
const BranchesSection = ({ branches }) => (
  <div className="space-y-4">
    {branches.map((branch, index) => (
      <Card key={branch.name} className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fadeInUp`} style={{ animationDelay: `${index * 100}ms` }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                <p className="text-sm text-gray-600">
                  Last commit: {new Date(branch.commit.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {branch.protected && (
                <Badge className="bg-yellow-100 text-yellow-700">
                  <Shield className="h-3 w-3 mr-1" />
                  Protected
                </Badge>
              )}
              <Badge className={branch.name === 'main' || branch.name === 'master' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                {branch.name === 'main' || branch.name === 'master' ? 'Default' : 'Feature'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Analytics Section Component
const AnalyticsSection = ({ codeFrequency, contributorsData, commits }) => {
  // Calculate max values for better scaling
  const maxAdditions = Math.max(...codeFrequency.map(week => week.additions || 0));
  const maxDeletions = Math.max(...codeFrequency.map(week => week.deletions || 0));
  const maxChanges = Math.max(maxAdditions, maxDeletions);
  
  // Format code frequency data for the chart
  const chartData = codeFrequency.slice(0, 12).map(week => {
    const weekDate = new Date(week.week);
    return {
      name: weekDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
      }),
      additions: week.additions || 0,
      deletions: week.deletions || 0,
      net: (week.additions || 0) - (week.deletions || 0)
    };
  }).reverse();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Code Activity Trends
          </CardTitle>
          <p className="text-sm text-gray-600">Weekly additions and deletions over time</p>
        </CardHeader>
        <CardContent>
          {codeFrequency.length > 0 ? (
            <div className="space-y-6">
              {/* Chart Visualization */}
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value, name) => [value, name === 'additions' ? 'Additions' : name === 'deletions' ? 'Deletions' : 'Net Change']}
                      labelFormatter={(label) => `Week of ${label}`}
                    />
                    <Legend formatter={(value) => value === 'additions' ? 'Additions' : value === 'deletions' ? 'Deletions' : 'Net Change'} />
                    <Area type="monotone" dataKey="additions" stroke="#10B981" fillOpacity={0.5} fill="#DCFCE7" activeDot={{ r: 6 }} strokeWidth={2} />
                    <Area type="monotone" dataKey="deletions" stroke="#EF4444" fillOpacity={0.5} fill="#FEE2E2" activeDot={{ r: 6 }} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Traditional Bar Visualization Below the Chart */}
              {chartData.map((week, index) => {
                const additionsPercent = maxChanges > 0 ? (week.additions / maxChanges) * 100 : 0;
                const deletionsPercent = maxChanges > 0 ? (week.deletions / maxChanges) * 100 : 0;
                const netChanges = week.net;
                
                return (
                  <div key={index} className="group space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {week.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-full ${
                          netChanges > 0 ? 'bg-green-100 text-green-700' : 
                          netChanges < 0 ? 'bg-red-100 text-red-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {netChanges > 0 ? '+' : ''}{netChanges}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {/* Additions Bar */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-green-600 w-8">+{week.additions}</span>
                        <div className="flex-1 bg-green-50 rounded-full h-3 relative overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-500 h-full transition-all duration-1000 ease-out rounded-full shadow-sm group-hover:shadow-md"
                            style={{ 
                              width: `${additionsPercent}%`,
                              animationDelay: `${index * 100}ms`
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Deletions Bar */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-red-600 w-8">-{week.deletions}</span>
                        <div className="flex-1 bg-red-50 rounded-full h-3 relative overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-red-400 to-red-500 h-full transition-all duration-1000 ease-out rounded-full shadow-sm group-hover:shadow-md"
                            style={{ 
                              width: `${deletionsPercent}%`,
                              animationDelay: `${index * 100 + 50}ms`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No code activity data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Commit Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commits.slice(0, 7).map((commit, index) => (
              <div key={commit.sha} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <GitCommit className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{getCommitMessage(commit)}</p>
                  <p className="text-xs text-gray-500">
                    {getCommitAuthorDisplay(commit)} • {getCommitDate(commit).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {commit.stats?.additions && (
                      <span className="text-green-600">+{commit.stats.additions}</span>
                    )}
                    {commit.stats?.deletions && (
                      <span className="text-red-600 ml-1">-{commit.stats.deletions}</span>
                    )}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VersionHistory;
