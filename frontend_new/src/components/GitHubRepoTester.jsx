import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { githubService } from '../services/githubService';
import { 
  Github, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Eye,
  Star,
  GitFork,
  Clock
} from 'lucide-react';

const GitHubRepoTester = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [commitsResult, setCommitsResult] = useState(null);
  const [testStage, setTestStage] = useState('');

  const testRepository = async () => {
    if (!repoUrl.trim()) {
      alert('Please enter a GitHub repository URL');
      return;
    }

    setIsLoading(true);
    setValidationResult(null);
    setCommitsResult(null);
    setTestStage('Validating repository...');

    try {
      // Test 1: Validate repository
      console.log('Testing repository URL:', repoUrl);
      const validation = await githubService.validateRepository(repoUrl);
      setValidationResult(validation);
      
      if (!validation.isValid) {
        setIsLoading(false);
        return;
      }

      // Test 2: Fetch commits
      setTestStage('Fetching commits...');
      const commits = await githubService.getCommitHistory(repoUrl, 1, 10);
      setCommitsResult(commits);

    } catch (error) {
      console.error('Test failed:', error);
      setValidationResult({
        isValid: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
      setTestStage('');
    }
  };

  const testWithSampleRepo = () => {
    setRepoUrl('https://github.com/microsoft/vscode');
    // Auto-test after setting URL
    setTimeout(() => testRepository(), 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Repository Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter GitHub repository URL (e.g., https://github.com/owner/repo)"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testRepository} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Github className="h-4 w-4 mr-2" />
              )}
              Test Repository
            </Button>
          </div>

          {/* Sample Repository Button */}
          <div>
            <Button variant="outline" onClick={testWithSampleRepo}>
              Test with Sample Repository (VS Code)
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                {testStage}
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Results */}
          {validationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {validationResult.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Repository Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {validationResult.isValid ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900">Repository Details</h3>
                        <div className="space-y-2 mt-2">
                          <div>
                            <span className="text-sm text-gray-600">Name: </span>
                            <span className="font-medium">{validationResult.repoData.fullName}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Description: </span>
                            <span>{validationResult.repoData.description || 'No description'}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Language: </span>
                            <Badge variant="secondary">{validationResult.repoData.language || 'Multiple'}</Badge>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Private: </span>
                            <Badge variant={validationResult.repoData.isPrivate ? 'destructive' : 'outline'}>
                              {validationResult.repoData.isPrivate ? 'Private' : 'Public'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Statistics</h3>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">Stars: {validationResult.repoData.stargazers_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GitFork className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Forks: {validationResult.repoData.forks_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Watchers: {validationResult.repoData.watchers_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Updated: {new Date(validationResult.repoData.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Validation Failed:</strong> {validationResult.error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Commits Results */}
          {commitsResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Commits Test ({commitsResult.commits?.length || 0} commits fetched)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {commitsResult.commits && commitsResult.commits.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Recent Commits</h3>
                    {commitsResult.commits.slice(0, 5).map((commit) => (
                      <div key={commit.sha} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{commit.shortMessage}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              by {commit.author?.name || 'Unknown'} • {new Date(commit.author?.date || new Date()).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              SHA: <code className="bg-gray-200 px-1 rounded">{commit.shortSha}</code>
                            </p>
                          </div>
                          <Badge className="text-xs">
                            {commit.changeType}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No commits found. This might be an empty repository or there might be access issues.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Debug Info */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Entered URL: </span>
                  <code className="bg-gray-100 px-2 py-1 rounded">{repoUrl || 'None'}</code>
                </div>
                <div>
                  <span className="font-medium">GitHub API Base: </span>
                  <code className="bg-gray-100 px-2 py-1 rounded">https://api.github.com</code>
                </div>
                <div>
                  <span className="font-medium">Browser Console: </span>
                  <span>Check the browser console (F12) for detailed logs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default GitHubRepoTester;
