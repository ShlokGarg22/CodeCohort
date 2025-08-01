import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingCreators: 0,
    approvedCreators: 0,
    admins: 0
  });
  const [pendingCreators, setPendingCreators] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all users
      const usersResponse = await api.get('/auth/admin/users');
      const users = usersResponse.data.data.users;
      setAllUsers(users);

      // Fetch pending creators
      const pendingResponse = await api.get('/auth/admin/pending-creators');
      const pending = pendingResponse.data.data.pendingCreators;
      setPendingCreators(pending);

      // Calculate stats
      setStats({
        totalUsers: users.length,
        pendingCreators: users.filter(u => u.role === 'creator' && u.creatorStatus === 'pending').length,
        approvedCreators: users.filter(u => u.role === 'creator' && u.creatorStatus === 'approved').length,
        admins: users.filter(u => u.role === 'admin').length
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({
        show: true,
        message: 'Failed to load dashboard data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatorStatus = async (userId, status) => {
    try {
      await api.put('/auth/admin/creator-status', { userId, status });
      
      setAlert({
        show: true,
        message: `Creator request ${status} successfully`,
        type: 'success'
      });

      // Refresh data
      fetchData();
      
      setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 3000);
    } catch (error) {
      console.error('Error updating creator status:', error);
      setAlert({
        show: true,
        message: 'Failed to update creator status',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {alert.show && (
        <Alert className={`${alert.type === 'success' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}`}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Creators</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCreators}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Creators</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedCreators}</div>
            <p className="text-xs text-muted-foreground">Active creators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">Administrator accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Creator Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Creator Requests</CardTitle>
          <CardDescription>
            Review and approve creator account requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingCreators.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending creator requests</p>
          ) : (
            <div className="space-y-4">
              {pendingCreators.map((creator) => (
                <div key={creator._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{creator.fullName}</h3>
                      <Badge variant="outline">Creator</Badge>
                    </div>
                    <p className="text-sm text-gray-600">@{creator.username}</p>
                    <p className="text-sm text-gray-600">{creator.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Requested: {new Date(creator.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCreatorStatus(creator._id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCreatorStatus(creator._id, 'rejected')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Users */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Overview of all registered users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{user.fullName}</h4>
                    <Badge 
                      variant={
                        user.role === 'admin' ? 'default' : 
                        user.role === 'creator' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {user.role}
                    </Badge>
                    {user.role === 'creator' && (
                      <Badge 
                        variant={
                          user.creatorStatus === 'approved' ? 'default' : 
                          user.creatorStatus === 'pending' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {user.creatorStatus}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">@{user.username} • {user.email}</p>
                  <p className="text-xs text-gray-500">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
