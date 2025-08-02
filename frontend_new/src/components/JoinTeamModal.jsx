import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Users, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

const JoinTeamModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project,
  isLoading = false 
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(project._id, message.trim());
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error submitting join request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  if (!project) return null;

  const teamSlotsUsed = project.teamMembers?.length || 0;
  const maxTeamSize = project.maxTeamSize || 5;
  const hasAvailableSlots = teamSlotsUsed < maxTeamSize;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Join Project Team</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {project.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3">
                {project.description}
              </p>
            </div>

            {/* Project Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{teamSlotsUsed}/{maxTeamSize} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {format(new Date(project.createdAt), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>by {project.creator?.fullName}</span>
              </div>
            </div>

            {/* Difficulty Level */}
            {project.difficulty && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Difficulty:</span>
                <Badge 
                  className={
                    project.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    project.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }
                >
                  {project.difficulty}
                </Badge>
              </div>
            )}

            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <div>
                <span className="text-sm text-gray-600 mb-2 block">Technologies:</span>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Team Status */}
            <div className="p-3 bg-gray-50 rounded-lg">
              {hasAvailableSlots ? (
                <div className="text-green-600 text-sm font-medium">
                  ✅ Team has available slots ({maxTeamSize - teamSlotsUsed} remaining)
                </div>
              ) : (
                <div className="text-red-600 text-sm font-medium">
                  ❌ Team is currently full
                </div>
              )}
            </div>
          </div>

          {/* Join Request Form */}
          {hasAvailableSlots && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message to Creator (Optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the creator why you'd like to join this project..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">
                  {message.length}/500 characters
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Sending Request...' : 'Send Join Request'}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Full Team Message */}
          {!hasAvailableSlots && (
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTeamModal;
