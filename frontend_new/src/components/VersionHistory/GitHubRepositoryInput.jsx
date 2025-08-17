/**
 * GitHub Repository Input Component
 * Allows creators to input and lock GitHub repository URLs for their projects
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Github, 
  Lock, 
  Unlock, 
  ExternalLink, 
  Check, 
  X, 
  Loader2, 
  AlertTriangle,
  Star,
  GitFork,
  Calendar,
  User
} from 'lucide-react';
import { githubService } from '../../services/githubService';
import { problemService } from '../../services/problemService';
import { toast } from 'sonner';
import { format } from 'date-fns';

/**
 * Repository info display component
 */
const RepositoryInfo = ({ repoData, onUnlock, isLocked, canEdit }) => {
  return (
    <div className="space-y-4">
      {/* Repository header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Github className="h-6 w-6 text-gray-700" />
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {repoData.fullName}
            </h3>
            <p className="text-sm text-gray-600">
              {repoData.description || 'No description available'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isLocked ? 'default' : 'secondary'}>
            {isLocked ? (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3 mr-1" />
                Unlocked
              </>
            )}
          </Badge>
          {canEdit && isLocked && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUnlock}
            >
              <Unlock className="h-4 w-4 mr-2" />
              Unlock
            </Button>
          )}
        </div>
      </div>

      {/* Repository stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Owner:</span>
          <span className="font-medium">{repoData.owner.login}</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-gray-600">Stars:</span>
          <span className="font-medium">{repoData.stars?.toLocaleString() || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <GitFork className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Forks:</span>
          <span className="font-medium">{repoData.forks?.toLocaleString() || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Updated:</span>
          <span className="font-medium">
            {format(new Date(repoData.updatedAt), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Language and privacy */}
      <div className="flex items-center gap-4">
        {repoData.language && (
          <Badge variant="secondary">
            {repoData.language}
          </Badge>
        )}
        <Badge variant={repoData.isPrivate ? 'destructive' : 'outline'}>
          {repoData.isPrivate ? 'Private' : 'Public'}
        </Badge>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
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
  );
};

/**
 * Main GitHubRepositoryInput component
 */
const GitHubRepositoryInput = ({ 
  projectId, 
  initialRepoUrl = '', 
  isLocked = false, 
  canEdit = false,
  onRepositoryChange 
}) => {
  const [repoUrl, setRepoUrl] = useState(initialRepoUrl);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [locked, setLocked] = useState(isLocked);

  // Validate repository on mount if URL exists and when initialRepoUrl changes
  useEffect(() => {
    if (initialRepoUrl && initialRepoUrl !== repoUrl) {
      setRepoUrl(initialRepoUrl);
      validateRepository(initialRepoUrl, false);
    } else if (!initialRepoUrl && repoUrl) {
      // Reset if no initial URL
      setRepoUrl('');
      setIsValid(false);
      setValidationError('');
      setRepoData(null);
    }
  }, [initialRepoUrl]);

  // Update locked state when isLocked prop changes
  useEffect(() => {
    setLocked(isLocked);
  }, [isLocked]);

  /**
   * Validate GitHub repository URL
   */
  const validateRepository = async (url, showToast = true) => {
    if (!url || !url.trim()) {
      setIsValid(false);
      setValidationError('');
      setRepoData(null);
      return;
    }

    try {
      setIsValidating(true);
      setValidationError('');

      // Basic URL format check
      if (!url.includes('github.com')) {
        throw new Error('Please enter a valid GitHub repository URL');
      }

      const validation = await githubService.validateRepository(url);
      
      if (validation.isValid) {
        setIsValid(true);
        setRepoData(validation.repoData);
        if (showToast) {
          toast.success('Repository validated successfully!');
        }
      } else {
        setIsValid(false);
        setValidationError(validation.error);
        setRepoData(null);
        if (showToast) {
          toast.error(validation.error);
        }
      }
    } catch (error) {
      setIsValid(false);
      setValidationError(error.message);
      setRepoData(null);
      if (showToast) {
        toast.error(error.message);
      }
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Handle URL input change
   */
  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setRepoUrl(newUrl);
    
    // Reset validation state
    setIsValid(false);
    setValidationError('');
    setRepoData(null);
  };

  /**
   * Handle repository validation
   */
  const handleValidate = () => {
    validateRepository(repoUrl);
  };

  /**
   * Lock repository URL
   */
  const handleLock = async () => {
    if (!isValid || !repoData) {
      toast.error('Please validate the repository first');
      return;
    }

    if (!projectId) {
      toast.error('Project ID is required to lock repository');
      return;
    }

    try {
      // Save repository data to backend
      const repositoryData = {
        url: repoUrl,
        owner: repoData.owner?.login || '',
        name: repoData.name || '',
        fullName: repoData.full_name || '',
        isLocked: true
      };

      await problemService.updateGitHubRepository(projectId, repositoryData);
      
      setLocked(true);
      onRepositoryChange?.(repoUrl, repoData, true);
      toast.success('Repository locked successfully!');
    } catch (error) {
      console.error('Failed to lock repository:', error);
      toast.error('Failed to lock repository');
    }
  };

  /**
   * Unlock repository URL
   */
  const handleUnlock = async () => {
    if (!projectId) {
      toast.error('Project ID is required to unlock repository');
      return;
    }

    try {
      // Update repository data in backend
      const repositoryData = {
        url: repoUrl,
        owner: repoData?.owner?.login || '',
        name: repoData?.name || '',
        fullName: repoData?.full_name || '',
        isLocked: false
      };

      await problemService.updateGitHubRepository(projectId, repositoryData);
      
      setLocked(false);
      onRepositoryChange?.(repoUrl, repoData, false);
      toast.success('Repository unlocked');
    } catch (error) {
      console.error('Failed to unlock repository:', error);
      toast.error('Failed to unlock repository');
    }
  };

  // If repository is locked and valid, show repository info
  if (locked && repoData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Linked GitHub Repository
          </CardTitle>
          <CardDescription>
            This project is linked to a GitHub repository for version history tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RepositoryInfo
            repoData={repoData}
            onUnlock={handleUnlock}
            isLocked={locked}
            canEdit={canEdit}
          />
        </CardContent>
      </Card>
    );
  }

  // If user cannot edit, show read-only view
  if (!canEdit) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Github className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Repository Linked
            </h3>
            <p className="text-gray-600">
              Only the project creator can link a GitHub repository for version history tracking.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show input form
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          Link GitHub Repository
        </CardTitle>
        <CardDescription>
          Connect your project to a GitHub repository to enable version history tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            GitHub Repository URL
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type="url"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={handleUrlChange}
                className={`pr-10 ${
                  repoUrl && isValid 
                    ? 'border-green-500 focus:border-green-500' 
                    : repoUrl && validationError 
                    ? 'border-red-500 focus:border-red-500' 
                    : ''
                }`}
              />
              {/* Validation indicator */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isValidating && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                )}
                {!isValidating && repoUrl && isValid && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {!isValidating && repoUrl && validationError && (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <Button 
              onClick={handleValidate}
              disabled={!repoUrl || isValidating}
              variant="outline"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Validate'
              )}
            </Button>
          </div>
          
          {/* Validation error */}
          {validationError && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          
          {/* Helper text */}
          <p className="text-xs text-gray-600">
            Enter the URL of your GitHub repository (e.g., https://github.com/username/repo)
          </p>
        </div>

        {/* Repository info preview */}
        {isValid && repoData && (
          <div className="border rounded-lg p-4 bg-green-50">
            <RepositoryInfo
              repoData={repoData}
              onUnlock={() => {}}
              isLocked={false}
              canEdit={false}
            />
            
            {/* Lock button */}
            <div className="mt-4 pt-4 border-t border-green-200">
              <Button 
                onClick={handleLock}
                className="w-full"
              >
                <Lock className="h-4 w-4 mr-2" />
                Lock Repository
              </Button>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Once locked, this repository will be used for version history tracking
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            How it works:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Enter your GitHub repository URL</li>
            <li>• We'll validate that the repository is accessible</li>
            <li>• Lock the repository to enable version history tracking</li>
            <li>• View commit history and compare versions in the Version History page</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GitHubRepositoryInput;
