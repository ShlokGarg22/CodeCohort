import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Column from './Column';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import { taskService } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Plus, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

const COLUMNS = [
  { id: 'Backlog', title: 'Backlog' },
  { id: 'In Progress', title: 'In Progress' },
  { id: 'Review', title: 'Review' },
  { id: 'Completed', title: 'Completed' }
];

const KanbanBoard = ({ projectId, projectData }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Check user permissions
  const isCreator = user?.role === 'creator' && (
    projectData?.creator?._id === user?.id || 
    projectData?.creator === user?.id || 
    projectData?.createdBy?._id === user?.id ||
    projectData?.createdBy === user?.id
  );
  const isAdmin = user?.role === 'admin';
  const isDeveloper = user?.role === 'user' && (
    projectData?.teamMembers?.some(member => 
      member?._id === user?.id || member?.user?._id === user?.id || member === user?.id
    ) || projectData?.teamMembers?.includes(user?.id)
  );
  
  const canManageTasks = isCreator || isAdmin;
  const canViewAllTasks = isCreator || isAdmin;
  const canCreateTasks = isCreator || isAdmin || isDeveloper;

  useEffect(() => {
    if (user && projectId) {
      fetchTasks();
    }
  }, [projectId, user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getProjectTasks(projectId);
      // Backend returns { success: true, data: { tasks } }
      const tasksData = response?.data?.tasks || response?.tasks || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      setTasks([]); // Ensure tasks is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    if (!canManageTasks) {
      toast.error('You do not have permission to create tasks');
      return;
    }
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    if (!canManageTasks && task.assignee !== user?.id) {
      toast.error('You can only edit your own assigned tasks');
      return;
    }
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!canManageTasks) {
      toast.error('You do not have permission to delete tasks');
      return;
    }
    
    try {
      await taskService.deleteTask(taskId);
      setTasks(prev => (Array.isArray(prev) ? prev : []).filter(task => task._id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      if (editingTask) {
        const response = await taskService.updateTask(editingTask._id, taskData);
        setTasks(prev => (Array.isArray(prev) ? prev : []).map(task => 
          task._id === editingTask._id ? response.data.task || response.data : task
        ));
        toast.success('Task updated successfully');
      } else {
        const response = await taskService.createTask(projectId, taskData);
        setTasks(prev => [...(Array.isArray(prev) ? prev : []), response.data.task || response.data]);
        toast.success('Task created successfully');
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(error.message || 'Failed to save task');
    }
  };

  const handleDragStart = (event) => {
    const task = tasks.find(t => t._id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;
    const tasksArray = Array.isArray(tasks) ? tasks : [];
    const task = tasksArray.find(t => t._id === taskId);

    if (!task) return;

    // Check permissions
    if (!canManageTasks && task.assignee !== user?.id) {
      toast.error('You can only move your own assigned tasks');
      return;
    }

    if (task.status === newStatus) return;

    try {
      // Update in backend using updateTask
      const response = await taskService.updateTask(taskId, { status: newStatus });
      
      // Update UI with response data
      setTasks(prev => (Array.isArray(prev) ? prev : []).map(t => 
        t._id === taskId ? response.data.task || response.data : t
      ));
      
      toast.success('Task moved successfully');
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert optimistic update
      setTasks(prev => (Array.isArray(prev) ? prev : []).map(t => 
        t._id === taskId ? { ...t, status: task.status } : t
      ));
      toast.error('Failed to move task');
    }
  };

  // Filter tasks based on permissions and filters
  const getFilteredTasks = () => {
    let filteredTasks = Array.isArray(tasks) ? tasks : [];

    // Apply role-based filtering
    if (isDeveloper && !canViewAllTasks) {
      filteredTasks = filteredTasks.filter(task => task.assignee === user?.id);
    }

    // Apply user filters
    if (filterAssignee !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.assignee === filterAssignee);
    }

    if (filterPriority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filterPriority);
    }

    return filteredTasks;
  };

  const getTasksByColumn = (columnId) => {
    return getFilteredTasks().filter(task => task.status === columnId);
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Board</h1>
          <p className="text-gray-600 mt-1">{projectData?.title}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Filters */}
          {canViewAllTasks && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {projectData?.teamMembers?.map(member => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {canCreateTasks && (
            <Button onClick={handleCreateTask} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLUMNS.map(column => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={getTasksByColumn(column.id)}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              canManageTasks={canManageTasks}
              currentUserId={user?.id}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              canManageTasks={canManageTasks}
              currentUserId={user?.id}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        projectMembers={projectData?.teamMembers?.map(member => 
          member.user ? member.user : member
        ) || []}
        canAssignTasks={canManageTasks}
      />
    </div>
  );
};

export default KanbanBoard;
