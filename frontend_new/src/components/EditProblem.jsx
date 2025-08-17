import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
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
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const EditProblem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  // Available options for problem criteria
  const techStackOptions = [
    'React', 'Node.js', 'MongoDB', 'Stripe', 'Express.js', 'Next.js', 
    'Vue.js', 'Angular', 'Python', 'Django', 'Flask', 'PostgreSQL', 
    'MySQL', 'Redis', 'AWS', 'Docker', 'TypeScript', 'JavaScript'
  ];
  
  const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced'];
  const categoryOptions = [
    'Web Development', 'Mobile Development', 'API Development', 
    'Database Design', 'DevOps', 'UI/UX Design', 'Full Stack'
  ];
  const projectTypeOptions = [
    'E-commerce Website', 'Social Media App', 'Portfolio Website', 
    'Blog Platform', 'Task Management Tool', 'Chat Application', 
    'Weather App', 'Recipe Finder', 'Budget Tracker', 'News Aggregator'
  ];
  const timeEstimateOptions = [
    '1-2 weeks', '2-4 weeks', '1-2 months', '2-3 months', '3+ months'
  ];
  const teamSizeOptions = ['1-2 people', '3-4 people', '5-6 people', '7+ people'];

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    category: '',
    projectType: '',
    techStack: [],
    timeEstimate: '',
    teamSize: '',
    requirements: '',
    deliverables: '',
    evaluation: '',
    resources: '',
    tags: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newTag, setNewTag] = useState('');

  // Load existing problem data
  useEffect(() => {
    const loadProblem = async () => {
      try {
        setLoading(true);
        const result = await problemService.getProblemById(projectId);
        if (result.success) {
          const problem = result.data;
          setFormData({
            title: problem.title || '',
            description: problem.description || '',
            difficulty: problem.difficulty || '',
            category: problem.category || '',
            projectType: problem.projectType || '',
            techStack: problem.techStack || [],
            timeEstimate: problem.timeEstimate || '',
            teamSize: problem.teamSize || '',
            requirements: problem.requirements || '',
            deliverables: problem.deliverables || '',
            evaluation: problem.evaluation || '',
            resources: problem.resources || '',
            tags: problem.tags || []
          });
        } else {
          setError('Failed to load problem data');
          toast.error('Failed to load problem data');
        }
      } catch (err) {
        console.error('Error loading problem:', err);
        setError('Failed to load problem data');
        toast.error('Failed to load problem data');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProblem();
    }
  }, [projectId]);

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle tech stack selection
  const handleTechStackChange = (tech) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  // Handle tag addition
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Handle tag removal
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Validation
      if (!formData.title?.trim()) throw new Error('Title is required');
      if (!formData.description?.trim()) throw new Error('Description is required');
      if (!formData.difficulty) throw new Error('Difficulty is required');
      if (!formData.category) throw new Error('Category is required');
      if (!formData.projectType) throw new Error('Project type is required');
      if (!formData.techStack?.length) throw new Error('At least one technology is required');
      if (!formData.timeEstimate) throw new Error('Time estimate is required');
      if (!formData.teamSize) throw new Error('Team size is required');
      if (!formData.requirements?.trim()) throw new Error('Requirements are required');

      const result = await problemService.updateProblem(projectId, formData);
      
      if (result.success) {
        toast.success('Project updated successfully!');
        navigate('/creator-dashboard');
      } else {
        throw new Error(result.message || 'Failed to update project');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update project');
      toast.error(err.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading project data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/creator-dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Project</h1>
          <p className="text-gray-600">Update your coding project details</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-500 text-red-700">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Core details about your coding project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., E-commerce Shopping Cart"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this project involves and what participants will build..."
                  className="mt-1 min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select value={formData.projectType} onValueChange={(value) => handleInputChange('projectType', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypeOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Requirements</CardTitle>
              <CardDescription>
                Technologies and timeline for the project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tech Stack * (Select all that apply)</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {techStackOptions.map(tech => (
                    <label key={tech} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.techStack.includes(tech)}
                        onChange={() => handleTechStackChange(tech)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{tech}</span>
                    </label>
                  ))}
                </div>
                {formData.techStack.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.techStack.map(tech => (
                      <Badge key={tech} variant="secondary" className="cursor-pointer" onClick={() => handleTechStackChange(tech)}>
                        {tech} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeEstimate">Time Estimate *</Label>
                  <Select value={formData.timeEstimate} onValueChange={(value) => handleInputChange('timeEstimate', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeEstimateOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="teamSize">Team Size *</Label>
                  <Select value={formData.teamSize} onValueChange={(value) => handleInputChange('teamSize', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamSizeOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Detailed requirements and expectations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="requirements">Requirements *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="List the specific requirements and features that need to be implemented..."
                  className="mt-1 min-h-[100px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="deliverables">Deliverables</Label>
                <Textarea
                  id="deliverables"
                  value={formData.deliverables}
                  onChange={(e) => handleInputChange('deliverables', e.target.value)}
                  placeholder="What should be delivered at the end of the project? (optional)"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="evaluation">Evaluation Criteria</Label>
                <Textarea
                  id="evaluation"
                  value={formData.evaluation}
                  onChange={(e) => handleInputChange('evaluation', e.target.value)}
                  placeholder="How will the project be evaluated? (optional)"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="resources">Resources & References</Label>
                <Textarea
                  id="resources"
                  value={formData.resources}
                  onChange={(e) => handleInputChange('resources', e.target.value)}
                  placeholder="Helpful links, documentation, or resources (optional)"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tags..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} <Trash2 className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/creator-dashboard')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProblem;
