/**
 * Demo Version History Page
 * For testing the Version History feature with real GitHub data
 * Navigate to: /demo/version-history
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ArrowLeft, 
  Github, 
  ExternalLink, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  GitBranch,
  Code
} from 'lucide-react';
import { githubService } from '../services/githubService';
import CommitTimeline from './VersionHistory/CommitTimeline';
import CommitComparison from './VersionHistory/CommitComparison';
import { toast } from 'sonner';

const DemoVersionHistory = () => {
  const navigate = useNavigate();
  
  // Demo state
  const [repoUrl, setRepoUrl] = useState('https://github.com/microsoft/vscode');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [repoData, setRepoData] = useState(null);
  const [commits, setCommits] = useState([]);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // View mode state
  const [viewMode, setViewMode] = useState('timeline');
  const [selectedCommits, setSelectedCommits] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Popular demo repositories
  const demoRepos = [
    'https://github.com/microsoft/vscode',
    'https://github.com/facebook/react',
    'https://github.com/vercel/next.js',
    'https://github.com/nodejs/node',
    'https://github.com/expressjs/express'
  ];

  /**
   * Validate and load repository
   */
  const validateAndLoadRepo = async (url) => {
    try {
      setIsValidating(true);
      setIsValid(false);
      setRepoData(null);
      setCommits([]);

      // Validate repository
      const validation = await githubService.validateRepository(url);
      
      if (validation.isValid) {
        setIsValid(true);
        setRepoData(validation.repoData);
        toast.success('Repository validated successfully!');
        
        // Load commits
        await loadCommits(url);
      } else {
        toast.error(validation.error);
      }
    } catch (error) {
      console.error('Failed to validate repository:', error);
      toast.error(error.message);
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Load commits for repository
   */
  const loadCommits = async (url, page = 1, append = false) => {
    try {
      setCommitsLoading(true);
      
      const result = await githubService.getCommitHistory(url, page, 20);
      
      if (append) {
        setCommits(prev => [...prev, ...result.commits]);
      } else {
        setCommits(result.commits);
      }
      
      setHasMore(result.hasMore);
      setCurrentPage(page);
      
    } catch (error) {
      console.error('Failed to load commits:', error);
      toast.error(`Failed to load commits: ${error.message}`);
    } finally {
      setCommitsLoading(false);
    }
  };

  /**
   * Load more commits
   */
  const loadMoreCommits = () => {
    if (repoUrl && hasMore && !commitsLoading) {
      loadCommits(repoUrl, currentPage + 1, true);
    }
  };

  /**
   * Refresh commits
   */
  const refreshCommits = () => {
    if (repoUrl) {
      loadCommits(repoUrl, 1, false);
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
        return prev.filter(c => c.sha !== commit.sha);
      } else if (prev.length < 2) {
        return [...prev, commit];
      } else {
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
      
      const sortedCommits = [...selectedCommits].sort((a, b) => a.timestamp - b.timestamp);
      const [baseCommit, headCommit] = sortedCommits;
      
      const comparison = await githubService.compareCommits(
        repoUrl,
        baseCommit.sha,
        headCommit.sha
      );
      
      setComparisonData({
        ...comparison,
        baseCommit,
        headCommit
      });
      
    } catch (error) {
      console.error('Failed to compare commits:', error);
      toast.error(`Failed to compare commits: ${error.message}`);
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

  // Load default repository on mount
  useEffect(() => {
    validateAndLoadRepo(repoUrl);
  }, []);

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
                  Version History Demo
                </h1>
                <p className="text-sm text-gray-600">
                  Test the Version History feature with real GitHub repositories
                </p>
              </div>
            </div>
            
            <Badge variant="secondary" className="flex items-center gap-1">
              <Code className="h-3 w-3" />
              Demo Mode
            </Badge>
          </div>
        </div>
      </div>

      {/* Repository Input */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub Repository
            </CardTitle>
            <CardDescription>
              Enter any public GitHub repository URL to view its version history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* URL Input */}
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => validateAndLoadRepo(repoUrl)}
                disabled={!repoUrl || isValidating}
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Load
              </Button>
            </div>

            {/* Demo repositories */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Try these popular repositories:
              </label>
              <div className="flex flex-wrap gap-2">
                {demoRepos.map((repo) => (
                  <Button
                    key={repo}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRepoUrl(repo);
                      validateAndLoadRepo(repo);
                    }}
                    className="text-xs"
                  >
                    {repo.split('/').slice(-2).join('/')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Repository info */}
            {isValid && repoData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-900">
                      {repoData.fullName}
                    </h3>
                    <p className="text-sm text-green-700">
                      {repoData.description || 'No description available'}
                    </p>
                  </div>
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
            )}
          </CardContent>
        </Card>

        {/* Loading state */}
        {isValidating && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading repository data...</p>
          </div>
        )}

        {/* Error state */}
        {!isValidating && !isValid && repoUrl && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load repository. Please check the URL and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Version History Content */}
        {isValid && repoData && (
          <>
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Version History
              </h2>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('timeline')}
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Timeline
                </Button>
                <Button
                  variant={viewMode === 'compare' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('compare')}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Compare
                </Button>
              </div>
            </div>

            {/* Comparison Mode Header */}
            {viewMode === 'compare' && (
              <Card className="mb-6">
                <CardContent className="pt-4">
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
                            <Code className="h-4 w-4 mr-2" />
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

            {/* Timeline */}
            <CommitTimeline
              commits={commits}
              loading={commitsLoading}
              hasMore={hasMore}
              onLoadMore={loadMoreCommits}
              onRefresh={refreshCommits}
              repoData={repoData}
              isCompareMode={viewMode === 'compare'}
              selectedCommits={selectedCommits}
              onCommitSelect={handleCommitSelection}
            />

            {/* Comparison */}
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

export default DemoVersionHistory;
