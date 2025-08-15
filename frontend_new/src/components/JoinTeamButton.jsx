import React, { useState } from 'react';
import { Users, Send, Loader2 } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';

const JoinTeamButton = ({ 
  projectId, 
  projectTitle, 
  isAlreadyMember = false, 
  creatorId = null,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false
}) => {
  const { sendJoinRequest, isAuthenticated, connectionStatus } = useSocket();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Don't show join button if user is already a member or is the creator
  if (isAlreadyMember || (user && creatorId && (user._id === creatorId || user.id === creatorId))) {
    return null;
  }

  const handleJoinRequest = async () => {
    if (!isAuthenticated) {
      toast.error('Please wait for socket connection to establish');
      return;
    }

    if (!user) {
      toast.error('Please log in to join a team');
      return;
    }

    setIsLoading(true);

    try {
      await sendJoinRequest(projectId, message.trim());
      
      toast.success('Join request sent successfully!', {
        description: 'The project creator will be notified of your request.',
        duration: 6000
      });
      
      setIsOpen(false);
      setMessage('');
    } catch (error) {
      console.error('Error sending join request:', error);
      
      if (error.message.includes('already sent')) {
        toast.error('You have already sent a join request for this project');
      } else if (error.message.includes('already member')) {
        toast.error('You are already a member of this project');
      } else if (error.message.includes('not found')) {
        toast.error('Project not found or no longer available');
      } else if (error.message.includes('timeout')) {
        toast.error('Request timed out. Please check your connection and try again.');
      } else {
        toast.error('Failed to send join request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isSocketDisconnected = !isAuthenticated || connectionStatus === 'disconnected';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`${className}`}
          disabled={disabled || isSocketDisconnected}
          title={isSocketDisconnected ? 'Connecting to real-time service...' : 'Join this team'}
        >
          {isSocketDisconnected ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Users className="h-4 w-4 mr-2" />
          )}
          Join Team
          {isSocketDisconnected && (
            <span className="ml-1 text-xs opacity-75">(Connecting...)</span>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Join Team Request
          </DialogTitle>
          <DialogDescription>
            Send a request to join "{projectTitle}". The project creator will review your request.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="message" className="text-sm font-medium">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Tell the creator why you'd like to join this project..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={4}
              className="mt-1 resize-none"
              disabled={isLoading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </div>
          </div>
          
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <div className={`h-2 w-2 rounded-full ${
              isAuthenticated ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
            }`} />
            <span className="text-gray-600">
              {isAuthenticated ? 'Connected' : 'Connecting to real-time service...'}
            </span>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsOpen(false);
              setMessage('');
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleJoinRequest}
            disabled={isLoading || !isAuthenticated}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTeamButton;
