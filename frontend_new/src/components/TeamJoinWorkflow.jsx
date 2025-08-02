import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight, Users, UserCheck, Kanban } from 'lucide-react';

const TeamJoinWorkflow = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Team Collaboration Workflow</h2>
        <p className="text-gray-600">How developers join projects and access Kanban boards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Developer Requests */}
        <Card className="relative">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <Badge className="bg-blue-100 text-blue-700 w-fit mx-auto mb-2">Step 1</Badge>
            <CardTitle className="text-lg">Developer Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Browse available projects in dashboard</li>
              <li>• Click "Join" button on project card</li>
              <li>• Fill optional message to creator</li>
              <li>• Send join request</li>
              <li>• Can join max 3 projects</li>
            </ul>
          </CardContent>
          <ArrowRight className="hidden md:block absolute -right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
        </Card>

        {/* Step 2: Creator Approves */}
        <Card className="relative">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <Badge className="bg-green-100 text-green-700 w-fit mx-auto mb-2">Step 2</Badge>
            <CardTitle className="text-lg">Creator Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Creator sees join requests in dashboard</li>
              <li>• Reviews developer profile & message</li>
              <li>• Clicks "Approve" or "Reject"</li>
              <li>• Team member added to project</li>
              <li>• Developer gets access instantly</li>
            </ul>
          </CardContent>
          <ArrowRight className="hidden md:block absolute -right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
        </Card>

        {/* Step 3: Access Kanban */}
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Kanban className="h-6 w-6 text-purple-600" />
            </div>
            <Badge className="bg-purple-100 text-purple-700 w-fit mx-auto mb-2">Step 3</Badge>
            <CardTitle className="text-lg">Access Kanban Board</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• "My Teams" appears in navbar</li>
              <li>• Click project to open Kanban board</li>
              <li>• View & edit assigned tasks</li>
              <li>• Drag tasks between columns</li>
              <li>• Collaborate with team members</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Role-based Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-purple-600" />
              </div>
              Creator Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✅ Create projects and manage teams</li>
              <li>✅ Approve/reject join requests</li>
              <li>✅ Create, assign, and manage all tasks</li>
              <li>✅ View all team member tasks</li>
              <li>✅ Full Kanban board control</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              Developer Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✅ Browse and join available projects</li>
              <li>✅ Join up to 3 projects maximum</li>
              <li>✅ View and edit assigned tasks only</li>
              <li>✅ Move own tasks between columns</li>
              <li>✅ Team navigation in navbar</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamJoinWorkflow;
