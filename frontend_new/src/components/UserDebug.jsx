import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const UserDebug = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>User Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Token in localStorage:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}
        </div>
        {user ? (
          <>
            <div>
              <strong>User ID:</strong> {user._id || 'N/A'}
            </div>
            <div>
              <strong>Username:</strong> {user.username || 'N/A'}
            </div>
            <div>
              <strong>Email:</strong> {user.email || 'N/A'}
            </div>
            <div>
              <strong>Role:</strong> {user.role || 'N/A'}
            </div>
            <div>
              <strong>Creator Status:</strong> {user.creatorStatus || 'N/A'}
            </div>
            <div>
              <strong>Status:</strong> {user.status || 'N/A'}
            </div>
          </>
        ) : (
          <div>
            <strong>User object:</strong> null
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserDebug;
