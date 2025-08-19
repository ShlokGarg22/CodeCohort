import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { problemService } from '../services/problemService';
import { 
  Code, 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft
} from 'lucide-react';

const CreateProblem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Available options for problem criteria
  const techStackOptions = [
    'React', 'Node.js', 'MongoDB', 'Stripe', 'Express.js', 'Next.js', 
    'Vue.js', 'Angular', 'Python', 'Django', 'Flask', 'PostgreSQL', 
    'MySQL', 'Redis', 'AWS', 'Docker', 'TypeScript', 'JavaScript'
  ];
  
  const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];
  
  const categoryOptions = [
    'Full Stack Development', 'Frontend Development', 'Backend Development',
    'Mobile Development', 'Data Science', 'Machine Learning', 'DevOps',
    'Blockchain', 'Game Development', 'API Development'
  ];
  
  const projectTypes = [
    'Web Application', 'Mobile App', 'Desktop Application', 'API Service',
    'Chrome Extension', 'CLI Tool', 'Library/Package', 'Microservice'
  ];
  
  const timeEstimates = [
    '1-2 days', '3-5 days', '1 week', '2-3 weeks', '1 month', '2-3 months'
  ];
  
  const teamSizes = ['Solo (1 member)', '1-2 members', '2-3 members', '3-5 members', '5+ members'];
  
  const [problemData, setProblemData] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    category: 'Full Stack Development',
    projectType: 'Web Application',
    techStack: [],
    timeEstimate: '2-3 weeks',
    teamSize: '1-2 members',
    requirements: '',
    deliverables: '',
    evaluation: '',
    resources: '',
    tags: []
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

  // Check if user is approved creator
  if (user?.role !== 'creator' || user?.creatorStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Only approved creators can create problems.
              </p>
              
              {/* Debug Information */}
              <div className="bg-gray-100 p-3 rounded text-sm">
                <div><strong>Current Status:</strong></div>
                <div>Role: {user?.role || 'Not logged in'}</div>
                <div>Creator Status: {user?.creatorStatus || 'N/A'}</div>
                <div>Authenticated: {user ? 'Yes' : 'No'}</div>
                <div>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
              </div>

              {!user && (
                <p className="text-sm text-red-600">
                  Please log in to access this page.
                </p>
              )}
              
              {user && user.role !== 'creator' && (
                <p className="text-sm text-red-600">
                  You need to have a 'creator' role to create problems. Your current role is '{user.role}'.
                </p>
              )}
              
              {user && user.role === 'creator' && user.creatorStatus !== 'approved' && (
                <p className="text-sm text-red-600">
                  Your creator status is '{user.creatorStatus}'. It needs to be 'approved' to create problems.
                </p>
              )}
            </div>
            <Button onClick={() => navigate('/dashboard')} className="w-full mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProblemData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field, value) => {
    setProblemData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !problemData.tags.includes(currentTag.trim())) {
      setProblemData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setProblemData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleTechStack = (tech) => {
    setProblemData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate required fields
      if (!problemData.title.trim() || !problemData.description.trim()) {
        setAlert({
          show: true,
          message: 'Title and description are required',
          type: 'error'
        });
        return;
      }

      if (problemData.techStack.length === 0) {
        setAlert({
          show: true,
          message: 'Please select at least one technology from the tech stack',
          type: 'error'
        });
        return;
      }

      if (!problemData.requirements.trim()) {
        setAlert({
          show: true,
          message: 'Project requirements are required',
          type: 'error'
        });
        return;
      }

      // Create problem using the service
      const result = await problemService.createProblem(problemData);

      if (result.success) {
        setAlert({
          show: true,
          message: 'Project created successfully!',
          type: 'success'
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }

    } catch (error) {
      console.error('Error creating project:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to create project';
      
      if (error.message.includes('Access token required')) {
        errorMessage = 'You are not logged in. Please log in and try again.';
      } else if (error.message.includes('Access denied')) {
        errorMessage = 'You do not have permission to create projects. Only approved creators can create projects.';
      } else if (error.message.includes('Validation error') || error.message.includes('Validation failed')) {
        errorMessage = 'Please check your input data. Some fields may be invalid.';
      } else if (error.message.includes('Unable to connect')) {
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else {
        errorMessage = error.message || 'Failed to create project';
      }
      
      setAlert({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Project Challenge</h1>
              <p className="text-gray-600 mt-1">Design a project-based challenge for the community</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {alert.show && (
          <Alert className={`mb-6 ${alert.type === 'success' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}`}>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>
                Define the core details of your project challenge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={problemData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., E-commerce Platform"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={problemData.description}
                  onChange={handleInputChange}
                  placeholder="Build a full-stack e-commerce platform with user authentication, product management, and payment integration."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={problemData.difficulty} onValueChange={(value) => handleSelectChange('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={problemData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select value={problemData.projectType} onValueChange={(value) => handleSelectChange('projectType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeEstimate">Time Estimate</Label>
                  <Select value={problemData.timeEstimate} onValueChange={(value) => handleSelectChange('timeEstimate', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time estimate" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeEstimates.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="teamSize">Recommended Team Size</Label>
                <Select value={problemData.teamSize} onValueChange={(value) => handleSelectChange('teamSize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamSizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card>
            <CardHeader>
              <CardTitle>Tech Stack *</CardTitle>
              <CardDescription>
                Select the technologies required for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {techStackOptions.map((tech) => (
                  <div
                    key={tech}
                    onClick={() => toggleTechStack(tech)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      problemData.techStack.includes(tech)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-center">{tech}</div>
                  </div>
                ))}
              </div>
              {problemData.techStack.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Selected Technologies:</div>
                  <div className="flex flex-wrap gap-2">
                    {problemData.techStack.map((tech) => (
                      <Badge key={tech} variant="default" className="bg-blue-600">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Requirements</CardTitle>
              <CardDescription>
                Define what needs to be built and delivered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="requirements">Requirements *</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={problemData.requirements}
                  onChange={handleInputChange}
                  placeholder="List the key features and functionality that must be implemented..."
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="deliverables">Deliverables</Label>
                <Textarea
                  id="deliverables"
                  name="deliverables"
                  value={problemData.deliverables}
                  onChange={handleInputChange}
                  placeholder="What should participants submit? (e.g., source code, live demo, documentation...)"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="evaluation">Evaluation Criteria</Label>
                <Textarea
                  id="evaluation"
                  name="evaluation"
                  value={problemData.evaluation}
                  onChange={handleInputChange}
                  placeholder="How will submissions be evaluated? (e.g., functionality, code quality, design...)"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="resources">Resources & References</Label>
                <Textarea
                  id="resources"
                  name="resources"
                  value={problemData.resources}
                  onChange={handleInputChange}
                  placeholder="Helpful links, documentation, or resources participants can use..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Add relevant tags to help categorize your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {problemData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {problemData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-red-100 rounded-full p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create Project'}
              <Save className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProblem;
