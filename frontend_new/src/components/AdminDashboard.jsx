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
  XCircle,
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Database,
  AlertTriangle,
  Activity,
  Settings,
  Download,
  Crown,
  Trash2,
  StopCircle
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeProjects: 0,
    totalMessages: 0,
    pendingRequests: 0,
    totalTeams: 0,
    activeSessions: 0,
    pendingCreators: 0,
    approvedCreators: 0,
    admins: 0
  });
  const [users, setUsers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '45ms',
    activeConnections: 127
  });
  const [activities, setActivities] = useState([]);
  const [pendingCreators, setPendingCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [projectAction, setProjectAction] = useState({ loading: false, projectId: null });

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    fetchAdminData();
    fetchSystemHealth();
    fetchRecentActivities();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch metrics
      const metricsRes = await api.get('/admin/metrics');
      const metricsData = metricsRes.data.data;
      setMetrics(metricsData);

      // Fetch all users
      const usersResponse = await api.get('/auth/admin/users');
      const users = usersResponse.data.data.users;
      setUsers(users);

      // Fetch pending creators
      const pendingResponse = await api.get('/auth/admin/pending-creators');
      const pending = pendingResponse.data.data.pendingCreators;
      setPendingCreators(pending);

      // Fetch problems
      const problemsRes = await api.get('/admin/problems');
      const problemsData = problemsRes.data.data;
      setProblems(problemsData);

      // Fetch team requests
      const requestsRes = await api.get('/admin/team-requests');
      const requestsData = requestsRes.data.data;
      setTeamRequests(requestsData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setAlert({
        show: true,
        message: 'Failed to load dashboard data',
        type: 'error'
      });
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const res = await api.get('/admin/system-health');
      const data = res.data.data;
      setSystemHealth(data);
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const res = await api.get('/admin/activities');
      const data = res.data.data;
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
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

      fetchAdminData();
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

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setAlert({
        show: true,
        message: `User role updated successfully`,
        type: 'success'
      });
      fetchAdminData();
      setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 3000);
    } catch (error) {
      console.error('Error updating user role:', error);
      setAlert({
        show: true,
        message: 'Failed to update user role',
        type: 'error'
      });
    }
  };

  const banUser = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/ban`);
      setAlert({
        show: true,
        message: `User banned successfully`,
        type: 'success'
      });
      fetchAdminData();
      setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 3000);
    } catch (error) {
      console.error('Error banning user:', error);
      setAlert({
        show: true,
        message: 'Failed to ban user',
        type: 'error'
      });
    }
  };

  const approveProblem = async (problemId) => {
    try {
      await api.patch(`/admin/problems/${problemId}/approve`);
      setAlert({
        show: true,
        message: `Problem approved successfully`,
        type: 'success'
      });
      fetchAdminData();
      setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 3000);
    } catch (error) {
      console.error('Error approving problem:', error);
      setAlert({
        show: true,
        message: 'Failed to approve problem',
        type: 'error'
      });
    }
  };

  const MetricsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalUsers}</div>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeProjects}</div>
          <p className="text-xs text-muted-foreground">+8% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Messages</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalMessages}</div>
          <p className="text-xs text-muted-foreground">+23% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Teams</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalTeams}</div>
          <p className="text-xs text-muted-foreground">+5% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.pendingRequests}</div>
          <p className="text-xs text-muted-foreground">Needs attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeSessions}</div>
          <p className="text-xs text-muted-foreground">Currently online</p>
        </CardContent>
      </Card>
    </div>
  );

  const UserManagement = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Joined</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.profileImage || '/default-avatar.png'} 
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-medium">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'creator' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="p-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="user">User</option>
                        <option value="creator">Creator</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => banUser(user._id)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        <UserX className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const ProblemModeration = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Project Management
        </CardTitle>
        <CardDescription>
          Manage, moderate, and control projects. End active projects or permanently delete them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Creator</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Created</th>
                <th className="text-left p-3">Team Size</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map(problem => (
                <tr key={problem._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{problem.title}</td>
                  <td className="p-3">{problem.createdBy?.fullName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      problem.projectStatus === 'active' ? 'bg-green-100 text-green-800' :
                      problem.projectStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                      problem.projectStatus === 'ended' ? 'bg-orange-100 text-orange-800' :
                      problem.projectStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                      problem.status === 'approved' ? 'bg-green-100 text-green-800' :
                      problem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {problem.projectStatus || problem.status || 'active'}
                    </span>
                  </td>
                  <td className="p-3">{new Date(problem.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">{problem.maxTeamSize}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveProblem(problem._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        disabled={problem.status === 'approved'}
                      >
                        Approve
                      </button>
                      {problem.projectStatus === 'active' && (
                        <>
                          <button
                            onClick={() => adminEndProject(problem._id, problem.title)}
                            className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 flex items-center gap-1"
                            disabled={projectAction.loading && projectAction.projectId === problem._id}
                          >
                            {projectAction.loading && projectAction.projectId === problem._id ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <StopCircle className="h-3 w-3" />
                            )}
                            End
                          </button>
                          <button
                            onClick={() => adminDeleteProject(problem._id, problem.title)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 flex items-center gap-1"
                            disabled={projectAction.loading && projectAction.projectId === problem._id}
                          >
                            {projectAction.loading && projectAction.projectId === problem._id ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                            Delete
                          </button>
                        </>
                      )}
                      {problem.projectStatus !== 'active' && (
                        <button
                          onClick={() => adminDeleteProject(problem._id, problem.title)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 flex items-center gap-1"
                          disabled={projectAction.loading && projectAction.projectId === problem._id}
                        >
                          {projectAction.loading && projectAction.projectId === problem._id ? (
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          Delete
                        </button>
                      )}
                      <button className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const SystemHealthCard = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{systemHealth.status}</div>
            <div className="text-sm text-gray-600">Status</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{systemHealth.uptime}</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{systemHealth.responseTime}</div>
            <div className="text-sm text-gray-600">Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{systemHealth.activeConnections}</div>
            <div className="text-sm text-gray-600">Connections</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RecentActivities = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map(activity => (
            <div key={activity._id} className="flex justify-between items-center p-3 border-b">
              <div>
                <span className="font-medium">{activity.user}</span>
                <span className="text-gray-600 ml-2">{activity.action}</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const exportData = async (dataType) => {
    try {
      const response = await api.get(`/admin/export?type=${dataType}`, {
        responseType: 'blob'
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `codecohort_${dataType}_export_${date}.json`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setAlert({
        show: true,
        message: `${dataType} data exported successfully`,
        type: 'success'
      });
      setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 3000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setAlert({
        show: true,
        message: `Failed to export ${dataType} data`,
        type: 'error'
      });
    }
  };

  const adminEndProject = async (projectId, projectTitle) => {
    const reason = prompt(`Enter reason for ending project "${projectTitle}":`);
    if (!reason) return;

    const status = confirm('Mark as completed? (OK for completed, Cancel for ended)') ? 'completed' : 'ended';

    try {
      setProjectAction({ loading: true, projectId });
      await api.put(`/admin/problems/${projectId}/end`, { reason, status });
      
      setAlert({
        show: true,
        message: `Project "${projectTitle}" has been ${status} successfully`,
        type: 'success'
      });
      
      fetchAdminData(); // Refresh data
      setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 3000);
    } catch (error) {
      console.error('Error ending project:', error);
      setAlert({
        show: true,
        message: error.response?.data?.message || 'Failed to end project',
        type: 'error'
      });
    } finally {
      setProjectAction({ loading: false, projectId: null });
    }
  };

  const adminDeleteProject = async (projectId, projectTitle) => {
    const confirmation = prompt(`Type "${projectTitle}" to confirm permanent deletion:`);
    if (confirmation !== projectTitle) {
      setAlert({
        show: true,
        message: 'Project deletion cancelled - title did not match',
        type: 'error'
      });
      return;
    }

    if (!confirm(`Are you absolutely sure you want to permanently delete "${projectTitle}"? This action cannot be undone and will remove all related data including tasks, messages, and team requests.`)) {
      return;
    }

    try {
      setProjectAction({ loading: true, projectId });
      await api.delete(`/admin/problems/${projectId}`);
      
      setAlert({
        show: true,
        message: `Project "${projectTitle}" has been permanently deleted`,
        type: 'success'
      });
      
      fetchAdminData(); // Refresh data
      setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 3000);
    } catch (error) {
      console.error('Error deleting project:', error);
      setAlert({
        show: true,
        message: error.response?.data?.message || 'Failed to delete project',
        type: 'error'
      });
    } finally {
      setProjectAction({ loading: false, projectId: null });
    }
  };

  const QuickActions = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
        <CardDescription>
          Download platform data in JSON format for analysis and backup
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => exportData('users')}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex flex-col items-center gap-2 transition-colors"
          >
            <Users className="h-6 w-6" />
            <span className="font-medium">Export Users</span>
            <span className="text-sm opacity-90">All user accounts & profiles</span>
          </button>
          
          <button 
            onClick={() => exportData('problems')}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 flex flex-col items-center gap-2 transition-colors"
          >
            <FileText className="h-6 w-6" />
            <span className="font-medium">Export Problems</span>
            <span className="text-sm opacity-90">All coding problems & projects</span>
          </button>
          
          <button 
            onClick={() => exportData('analytics')}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex flex-col items-center gap-2 transition-colors"
          >
            <TrendingUp className="h-6 w-6" />
            <span className="font-medium">Export Analytics</span>
            <span className="text-sm opacity-90">Platform usage & statistics</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button 
            onClick={fetchAdminData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {alert.show && (
        <Alert className={`${alert.type === 'success' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}`}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'problems', label: 'Problems', icon: FileText },
          { id: 'system', label: 'System', icon: Database }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <>
          <MetricsCards />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemHealthCard />
            <RecentActivities />
          </div>
          <QuickActions />
          
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
        </>
      )}

      {activeTab === 'users' && (
        <>
          <MetricsCards />
          <UserManagement />
        </>
      )}

      {activeTab === 'problems' && (
        <>
          <MetricsCards />
          <ProblemModeration />
        </>
      )}

      {activeTab === 'system' && (
        <>
          <SystemHealthCard />
          <RecentActivities />
          <QuickActions />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
