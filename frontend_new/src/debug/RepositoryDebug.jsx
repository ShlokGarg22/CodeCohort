import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { problemService } from '../services/problemService';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const RepositoryDebug = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const response = await problemService.getProblemById(projectId);
      setProject(response.data);
      
      // Try to get repository data
      try {
        const repoResponse = await problemService.getGitHubRepository(projectId);
        setRepoData(repoResponse.data);
      } catch (repoError) {
        console.log('No repository data:', repoError.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const lockRepository = async () => {
    try {
      await problemService.lockGitHubRepository(projectId);
      await loadProjectData(); // Reload data
    } catch (err) {
      console.error('Failed to lock repository:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Repository Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Project ID:</h3>
            <p className="text-sm text-gray-600">{projectId}</p>
          </div>
          
          <div>
            <h3 className="font-medium">User Role:</h3>
            <p className="text-sm text-gray-600">{user?.role}</p>
          </div>
          
          <div>
            <h3 className="font-medium">Is Creator:</h3>
            <p className="text-sm text-gray-600">
              {project?.createdBy?._id === user?._id ? 'Yes' : 'No'}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">GitHub Repository URL:</h3>
            <p className="text-sm text-gray-600">
              {project?.githubRepository?.url || 'Not set'}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Repository Locked:</h3>
            <p className="text-sm text-gray-600">
              {project?.githubRepository?.isLocked ? 'Yes' : 'No'}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Repository Data from API:</h3>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(repoData, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium">Full Project Data:</h3>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-60">
              {JSON.stringify(project, null, 2)}
            </pre>
          </div>
          
          {project?.createdBy?._id === user?._id && project?.githubRepository?.url && !project?.githubRepository?.isLocked && (
            <Button onClick={lockRepository}>
              Lock Repository for Version History
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RepositoryDebug;
