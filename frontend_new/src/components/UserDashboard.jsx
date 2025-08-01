import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Code, 
  Trophy, 
  Clock, 
  Star,
  TrendingUp,
  BookOpen
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    problemsSolved: 0,
    currentStreak: 0,
    totalSubmissions: 0,
    successRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendedProblems, setRecommendedProblems] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, these would be API calls
    setStats({
      problemsSolved: 12,
      currentStreak: 3,
      totalSubmissions: 28,
      successRate: 75
    });

    setRecentActivity([
      {
        id: 1,
        problemTitle: "Two Sum",
        status: "Solved",
        difficulty: "Easy",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        timeSpent: "15 min"
      },
      {
        id: 2,
        problemTitle: "Binary Search",
        status: "Attempted",
        difficulty: "Medium",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        timeSpent: "45 min"
      },
      {
        id: 3,
        problemTitle: "Valid Parentheses",
        status: "Solved",
        difficulty: "Easy",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        timeSpent: "20 min"
      }
    ]);

    setRecommendedProblems([
      {
        id: 1,
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        category: "Linked Lists",
        rating: 4.5,
        solvedBy: 1250
      },
      {
        id: 2,
        title: "Maximum Subarray",
        difficulty: "Medium",
        category: "Dynamic Programming",
        rating: 4.3,
        solvedBy: 890
      },
      {
        id: 3,
        title: "Valid Palindrome",
        difficulty: "Easy",
        category: "String Manipulation",
        rating: 4.1,
        solvedBy: 2100
      }
    ]);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'solved': return 'bg-green-100 text-green-800';
      case 'attempted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {user?.fullName}!</CardTitle>
          <CardDescription>
            Continue your coding journey and improve your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-2">Coding Enthusiast</Badge>
              <p className="text-sm text-gray-600">Keep practicing to unlock new achievements!</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Code className="h-4 w-4 mr-2" />
              Start Coding
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.problemsSolved}</div>
            <p className="text-xs text-muted-foreground">Great progress!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Code submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">Problem success rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest coding sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.problemTitle}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getDifficultyColor(activity.difficulty)}>
                        {activity.difficulty}
                      </Badge>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.date.toLocaleDateString()} • {activity.timeSpent}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Problems */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recommended for You
            </CardTitle>
            <CardDescription>
              Problems tailored to your skill level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendedProblems.map((problem) => (
                <div key={problem.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{problem.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty}
                      </Badge>
                      <span className="text-xs text-gray-500">{problem.category}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs">{problem.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {problem.solvedBy} solved
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Solve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
