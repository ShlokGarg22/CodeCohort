import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const GitHubCallback = () => {
  const navigate = useNavigate();
  const { updateUser, setIsAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Processing GitHub authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('GitHub callback processing...');
        console.log('Current URL:', window.location.href);
        
        // Get token and user data from URL params
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');
        
        console.log('Token:', token);
        console.log('User param:', userParam);
        console.log('Error:', error);

        if (error) {
          setStatus('error');
          setMessage('GitHub authentication failed. Please try again.');
          setTimeout(() => {
            navigate('/signin', { replace: true });
          }, 3000);
          return;
        }

        if (token && userParam) {
          // Parse user data
          const userData = JSON.parse(decodeURIComponent(userParam));
          console.log('Parsed user data:', userData);
          
          // Store token and update auth state
          localStorage.setItem('token', token);
          
          // Update auth state synchronously
          updateUser(userData);
          setIsAuthenticated(true);
          
          setStatus('success');
          setMessage('Successfully authenticated with GitHub!');
          
          console.log('Authentication successful, redirecting to dashboard...');
          
          // Force a page reload to the dashboard to ensure state is properly updated
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        } else {
          console.log('Missing token or user data');
          setStatus('error');
          setMessage('Invalid authentication data received.');
          setTimeout(() => {
            navigate('/signin', { replace: true });
          }, 3000);
        }
      } catch (error) {
        console.error('GitHub callback error:', error);
        setStatus('error');
        setMessage('An error occurred during authentication.');
        setTimeout(() => {
          navigate('/signin', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, updateUser, setIsAuthenticated]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
    }
  };

  const getAlertType = () => {
    switch (status) {
      case 'success':
        return 'border-green-500 text-green-700';
      case 'error':
        return 'border-red-500 text-red-700';
      default:
        return 'border-blue-500 text-blue-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">GitHub Authentication</CardTitle>
          <CardDescription className="text-center">
            Please wait while we complete your authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {getIcon()}
            
            <Alert className={getAlertType()}>
              <AlertDescription className="text-center">
                {message}
              </AlertDescription>
            </Alert>
            
            {status === 'loading' && (
              <p className="text-sm text-gray-600 text-center">
                This may take a few seconds...
              </p>
            )}
            
            {status === 'success' && (
              <p className="text-sm text-gray-600 text-center">
                Redirecting to your dashboard...
              </p>
            )}
            
            {status === 'error' && (
              <p className="text-sm text-gray-600 text-center">
                Redirecting to sign in page...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GitHubCallback;
