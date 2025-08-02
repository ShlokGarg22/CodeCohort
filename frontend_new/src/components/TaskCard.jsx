import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  MoreHorizontal, 
  Calendar, 
  User, 
  Edit, 
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { format, isAfter, isBefore, addDays } from 'date-fns';

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  canManageTasks, 
  currentUserId, 
  isDragging = false 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High':
        return <AlertCircle className="h-3 w-3" />;
      case 'Medium':
        return <Circle className="h-3 w-3" />;
      case 'Low':
        return <CheckCircle2 className="h-3 w-3" />;
      default:
        return <Circle className="h-3 w-3" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'Review':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return 'none';
    const today = new Date();
    const due = new Date(dueDate);
    
    if (isBefore(due, today)) return 'overdue';
    if (isBefore(due, addDays(today, 3))) return 'due-soon';
    return 'normal';
  };

  const getDueDateColor = (dueDateStatus) => {
    switch (dueDateStatus) {
      case 'overdue':
        return 'text-red-600 bg-red-50';
      case 'due-soon':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const canEditTask = canManageTasks || task.assignee?._id === currentUserId;
  const canDeleteTask = canManageTasks;

  const dueDateStatus = getDueDateStatus(task.dueDate);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md
        ${isDragging || isSortableDragging ? 'shadow-lg rotate-3 opacity-80' : ''}
        ${task.assignee?._id === currentUserId ? 'ring-2 ring-blue-200' : ''}
      `}
    >
      <CardContent className="p-4">
        {/* Task Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            {getStatusIcon(task.status)}
            <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">
              {task.title}
            </h4>
          </div>
          
          {(canEditTask || canDeleteTask) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {canEditTask && (
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {canDeleteTask && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(task._id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Task Description */}
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Priority and Due Date */}
        <div className="flex items-center justify-between mb-3">
          <Badge className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}>
            {getPriorityIcon(task.priority)}
            <span className="ml-1">{task.priority}</span>
          </Badge>
          
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${getDueDateColor(dueDateStatus)}`}>
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
            </div>
          )}
        </div>

        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-3 w-3" />
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={task.assignee.profileImage} />
                <AvatarFallback className="text-xs">
                  {task.assignee.fullName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">
                {task.assignee._id === currentUserId ? 'You' : task.assignee.fullName}
              </span>
            </div>
          </div>
        )}

        {/* Creation Date */}
        <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
          Created {format(new Date(task.createdAt), 'MMM dd, yyyy')}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
