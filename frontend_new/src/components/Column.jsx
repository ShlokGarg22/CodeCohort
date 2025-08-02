import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Badge } from './ui/badge';

const Column = ({ id, title, tasks, onEditTask, onDeleteTask, canManageTasks, currentUserId }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const getColumnColor = (columnId) => {
    switch (columnId) {
      case 'Backlog':
        return 'bg-gray-50 border-gray-200';
      case 'In Progress':
        return 'bg-blue-50 border-blue-200';
      case 'Review':
        return 'bg-yellow-50 border-yellow-200';
      case 'Completed':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getBadgeColor = (columnId) => {
    switch (columnId) {
      case 'Backlog':
        return 'bg-gray-100 text-gray-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Review':
        return 'bg-yellow-100 text-yellow-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-lg border-2 transition-colors duration-200 min-h-[500px]
        ${getColumnColor(id)}
        ${isOver ? 'border-blue-400 bg-blue-100' : ''}
      `}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <Badge className={`${getBadgeColor(id)} border-0`}>
            {tasks.length}
          </Badge>
        </div>
      </div>

      {/* Column Content */}
      <div className="p-4 space-y-3">
        <SortableContext 
          items={tasks.map(task => task._id)} 
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-sm">No tasks in {title.toLowerCase()}</p>
              {id === 'Backlog' && canManageTasks && (
                <p className="text-xs text-gray-400 mt-1">
                  Create a new task to get started
                </p>
              )}
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                canManageTasks={canManageTasks}
                currentUserId={currentUserId}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;
