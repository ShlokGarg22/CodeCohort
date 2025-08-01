import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { problemService } from '../services/problemService';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Code, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';

const CreatorDashboard = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);

  const isApproved = user?.creatorStatus === 'approved';
  const isPending = user?.creatorStatus === 'pending';
  const isRejected = user?.creatorStatus === 'rejected';

  useEffect(() => {
    if (isApproved) {
      fetchMyProblems();
    }
  }, [isApproved]);

  const fetchMyProblems = async () => {
    try {
      setLoading(true);
      const result = await problemService.getMyProblems();
      if (result.success) {
        setProblems(result.data.problems);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Creator Account Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your creator account is pending admin approval. You'll be able to create problems once approved.
              </AlertDescription>
            </Alert>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• An admin will review your creator request</li>
                <li>• You'll receive access to create coding problems once approved</li>
                <li>• Check back here for updates on your approval status</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Creator Account Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-500 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your creator account request has been rejected. Please contact an administrator for more information.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Creator Dashboard
          </CardTitle>
          <CardDescription>
            Welcome to your creator dashboard! Create and manage coding problems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="default" className="mb-2">Approved Creator</Badge>
              <p className="text-sm text-gray-600">You can now create coding problems for the community.</p>
            </div>
            <Link to="/create-problem">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Problem
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problems Created</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{problems.length}</div>
            <p className="text-xs text-muted-foreground">Total problems</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Problems</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Published problems</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Problems</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Unpublished drafts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Problems */}
      <Card>
        <CardHeader>
          <CardTitle>Your Problems</CardTitle>
          <CardDescription>
            Manage your created coding problems
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading your problems...</div>
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-8">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No problems yet</h3>
              <p className="text-gray-600 mb-4">Start creating your first coding problem!</p>
              <Link to="/create-problem">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Problem
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {problems.map((problem) => (
                <div key={problem._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{problem.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{problem.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{problem.difficulty}</Badge>
                      <Badge variant="secondary">{problem.category}</Badge>
                      {problem.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                      {problem.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{problem.tags.length - 2} more</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Created: {new Date(problem.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Code className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorDashboard;
