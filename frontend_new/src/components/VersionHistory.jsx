/**
 * Version History Page Component
 * Main page for viewing Git commit history and comparing versions
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
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
  Hash
} from 'lucide-react';
import { githubService } from '../services/githubService';
import CommitTimeline from './VersionHistory/CommitTimeline';
import CommitComparison from './VersionHistory/CommitComparison';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const VersionHistory = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Component state
  const [loading, setLoading] = useState(true);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [commits, setCommits] = useState([]);
  const [repoData, setRepoData] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // View mode state
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'compare'
  const [selectedCommits, setSelectedCommits] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  
  // Mock project data (in real app, fetch from your backend)
  const [project, setProject] = useState(null);
  
  // Get view mode from URL params
  useEffect(() => {
    const mode = searchParams.get('mode') || 'timeline';
    setViewMode(mode);
  }, [searchParams]);

  /**
   * Initialize component - fetch project data and commits
   */
  useEffect(() => {
    initializeVersionHistory();
  }, [projectId]);

  /**
   * Initialize version history data
   */
  const initializeVersionHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // For demo purposes, using mock project data
      // In real app, fetch project data from your backend API
      const mockProject = {
        id: projectId,
        title: 'CodeCohort Platform',
        description: 'A collaborative coding platform for developers',
        githubRepo: 'https://github.com/microsoft/vscode', // Demo repo
        creator: {
          id: '1',
          name: 'John Creator',
          avatar: 'https://github.com/github.png'
        },
        isCreator: user?.id === '1' // Mock creator check
      };
      
      setProject(mockProject);

      if (mockProject.githubRepo) {
        await fetchRepositoryData(mockProject.githubRepo);
        await fetchCommits(mockProject.githubRepo);
      } else {
        setError('No GitHub repository linked to this project');
      }

    } catch (err) {
      console.error('Failed to initialize version history:', err);
      setError('Failed to load version history data');
    } finally {
      setLoading(false);
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
   * Load more commits (pagination)
   */
  const loadMoreCommits = () => {
    if (project?.githubRepo && hasMore && !commitsLoading) {
      fetchCommits(project.githubRepo, currentPage + 1, true);
    }
  };

  /**
   * Refresh commits
   */
  const refreshCommits = () => {
    if (project?.githubRepo) {
      fetchCommits(project.githubRepo, 1, false);
    }
  };

  /**
   * Switch between timeline and comparison view
   */
  const switchViewMode = (mode) => {
    setViewMode(mode);
    setSearchParams({ mode });
    
    if (mode === 'timeline') {
      setSelectedCommits([]);
      setComparisonData(null);
    }
  };

  /**
   * Handle commit selection for comparison
   */
  const handleCommitSelection = (commit) => {
    if (viewMode !== 'compare') return;
    
    setSelectedCommits(prev => {
      const isSelected = prev.find(c => c.sha === commit.sha);
      
      if (isSelected) {
        // Deselect commit
        return prev.filter(c => c.sha !== commit.sha);
      } else if (prev.length < 2) {
        // Select commit (max 2)
        return [...prev, commit];
      } else {
        // Replace oldest selection
        return [prev[1], commit];
      }
    });
  };

  /**
   * Compare selected commits
   */
  const compareSelectedCommits = async () => {
    if (selectedCommits.length !== 2) {
      toast.error('Please select exactly 2 commits to compare');
      return;
    }

    try {
      setComparisonLoading(true);
      
      // Sort commits by date (older first)
      const sortedCommits = [...selectedCommits].sort((a, b) => a.timestamp - b.timestamp);
      const [baseCommit, headCommit] = sortedCommits;
      
      const comparison = await githubService.compareCommits(
        project.githubRepo,
        baseCommit.sha,
        headCommit.sha
      );
      
      setComparisonData({
        ...comparison,
        baseCommit,
        headCommit
      });
      
    } catch (err) {
      console.error('Failed to compare commits:', err);
      toast.error(`Failed to compare commits: ${err.message}`);
    } finally {
      setComparisonLoading(false);
    }
  };

  /**
   * Clear comparison
   */
  const clearComparison = () => {
    setSelectedCommits([]);
    setComparisonData(null);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading version history...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => navigate(-1)} 
                variant="outline" 
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button 
                onClick={initializeVersionHistory} 
                className="flex-1"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Version History
                </h1>
                <p className="text-sm text-gray-600">
                  {project?.title}
                </p>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchViewMode('timeline')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Timeline
              </Button>
              <Button
                variant={viewMode === 'compare' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchViewMode('compare')}
              >
                <GitCompare className="h-4 w-4 mr-2" />
                Compare
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Repository Info */}
      {repoData && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <GitBranch className="h-5 w-5 text-gray-400" />
                <div>
                  <h2 className="font-medium text-gray-900">
                    {repoData.fullName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {repoData.description || 'No description available'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {repoData.language || 'Multiple Languages'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Comparison Mode Header */}
        {viewMode === 'compare' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Compare Commits
              </CardTitle>
              <CardDescription>
                Select two commits to view their differences side by side
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedCommits.length === 0 && 'Select first commit...'}
                  {selectedCommits.length === 1 && 'Select second commit...'}
                  {selectedCommits.length === 2 && `Comparing ${selectedCommits[0].shortSha} with ${selectedCommits[1].shortSha}`}
                </div>
                <div className="flex gap-2">
                  {selectedCommits.length === 2 && (
                    <Button 
                      onClick={compareSelectedCommits}
                      disabled={comparisonLoading}
                      size="sm"
                    >
                      {comparisonLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <GitCompare className="h-4 w-4 mr-2" />
                      )}
                      Compare
                    </Button>
                  )}
                  {selectedCommits.length > 0 && (
                    <Button 
                      onClick={clearComparison}
                      variant="outline"
                      size="sm"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <CommitTimeline
            commits={commits}
            loading={commitsLoading}
            hasMore={hasMore}
            onLoadMore={loadMoreCommits}
            onRefresh={refreshCommits}
            repoData={repoData}
          />
        )}

        {/* Comparison View */}
        {viewMode === 'compare' && (
          <>
            <CommitTimeline
              commits={commits}
              loading={commitsLoading}
              hasMore={hasMore}
              onLoadMore={loadMoreCommits}
              onRefresh={refreshCommits}
              repoData={repoData}
              isCompareMode={true}
              selectedCommits={selectedCommits}
              onCommitSelect={handleCommitSelection}
            />
            
            {comparisonData && (
              <CommitComparison
                comparisonData={comparisonData}
                onClose={clearComparison}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VersionHistory;
