import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

const EndProjectModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  project, 
  loading = false 
}) => {
  const [status, setStatus] = useState('completed');
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const statusOptions = [
    { 
      value: 'completed', 
      label: 'Mark as Completed', 
      icon: CheckCircle, 
      color: 'text-green-600',
      description: 'Project goals have been achieved successfully' 
    },
    { 
      value: 'cancelled', 
      label: 'Cancel Project', 
      icon: XCircle, 
      color: 'text-red-600',
      description: 'Project is being cancelled before completion' 
    },
    { 
      value: 'ended', 
      label: 'End Project', 
      icon: Clock, 
      color: 'text-orange-600',
      description: 'Project is being terminated for other reasons' 
    }
  ];

  const selectedStatus = statusOptions.find(opt => opt.value === status);
  const StatusIcon = selectedStatus?.icon || CheckCircle;

  const handleSubmit = () => {
    if (confirmation !== project?.title) {
      return;
    }
    onConfirm({ status, reason });
  };

  const handleClose = () => {
    setStatus('completed');
    setReason('');
    setConfirmation('');
    onClose();
  };

  const isConfirmationValid = confirmation === project?.title;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            End Project
          </DialogTitle>
          <DialogDescription>
            This action will permanently end the project "{project?.title}". 
            All team members will be removed and pending requests will be cancelled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Project Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select project status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${option.color}`} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedStatus && (
              <p className="text-sm text-gray-600">
                {selectedStatus.description}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason {status === 'completed' ? '(Optional)' : '(Required)'}
            </Label>
            <Textarea
              id="reason"
              placeholder={
                status === 'completed' 
                  ? "Brief summary of achievements (optional)"
                  : status === 'cancelled'
                  ? "Explain why the project is being cancelled..."
                  : "Explain why the project is being ended..."
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {reason.length}/500 characters
            </div>
          </div>

          {/* Confirmation */}
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type the project title to confirm: <span className="font-mono text-sm bg-gray-100 px-1 rounded">{project?.title}</span>
            </Label>
            <Input
              id="confirmation"
              placeholder="Type project title exactly as shown above"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className={isConfirmationValid ? 'border-green-500' : ''}
            />
          </div>

          {/* Warning Alert */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Warning:</strong> This action cannot be undone. All team members will lose access 
              to the project, and it will be marked as {status} permanently.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading || 
              !isConfirmationValid || 
              (status !== 'completed' && !reason.trim())
            }
            className={`${
              status === 'completed' 
                ? 'bg-green-600 hover:bg-green-700' 
                : status === 'cancelled'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ending Project...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <StatusIcon className="h-4 w-4" />
                {selectedStatus?.label}
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EndProjectModal;
