const Task = require('../models/Task');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { z } = require('zod');

// Validation schema for creating a task
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
  description: z.string().optional().default(''),
  status: z.enum(['Backlog', 'In Progress', 'Review', 'Completed']).default('Backlog'),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  dueDate: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).default([]),
  assignee: z.string().optional().nullable()
});

// Validation schema for updating a task
const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters').optional(),
  description: z.string().optional(),
  status: z.enum(['Backlog', 'In Progress', 'Review', 'Completed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).optional(),
  assignee: z.string().optional().nullable(),
  order: z.number().optional()
});

// Create a new task
const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    console.log('Create task request:', {
      projectId,
      body: req.body,
      bodyType: typeof req.body,
      contentType: req.headers['content-type']
    });
    
    // Validate input
    const validatedData = createTaskSchema.parse(req.body);

    // Check if project exists and user has permission
    const project = await Problem.findById(projectId)
      .populate('teamMembers.user')
      .populate('createdBy');
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project is still active
    if (project.projectStatus !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot create tasks in a ${project.projectStatus} project`
      });
    }

    // Check permissions - Project creators, admins, and team members can create tasks
    const isProjectCreator = project.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isTeamMember = project.teamMembers.some(
      member => member.user._id.toString() === req.user._id.toString()
    );
    
    console.log('Task creation permission check:', {
      userId: req.user._id.toString(),
      userRole: req.user.role,
      projectCreator: project.createdBy.toString(),
      isProjectCreator,
      isAdmin,
      isTeamMember,
      teamMembers: project.teamMembers.map(m => ({
        userId: m.user._id.toString(),
        role: m.role
      }))
    });
    
    if (!isProjectCreator && !isAdmin && !isTeamMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be a project creator, admin, or team member to create tasks.'
      });
    }

    // If assignee is provided, validate they are part of the team
    if (validatedData.assignee) {
      const isTeamMember = project.teamMembers.some(
        member => member.user._id.toString() === validatedData.assignee
      );
      
      if (!isTeamMember) {
        return res.status(400).json({
          success: false,
          message: 'Assignee must be a team member of this project'
        });
      }
    }

    // Get the next order number for the status column
    const lastTask = await Task.findOne({ 
      projectId, 
      status: validatedData.status 
    }).sort({ order: -1 });
    
    const order = lastTask ? lastTask.order + 1 : 0;

    // Create new task
    const task = new Task({
      ...validatedData,
      projectId,
      createdBy: req.user._id,
      order,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null
    });

    await task.save();
    await task.populate(['assignee', 'createdBy', 'projectId']);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all tasks for a project
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if project exists and user has access
    const project = await Problem.findById(projectId).populate('teamMembers.user');
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const isProjectCreator = project.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isTeamMember = project.teamMembers.some(
      member => member.user._id.toString() === req.user._id.toString()
    );

    if (!isProjectCreator && !isAdmin && !isTeamMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be a team member to view tasks.'
      });
    }

    let query = { projectId };

    // If user is a developer (not creator or admin), only show their assigned tasks
    if (!isProjectCreator && !isAdmin) {
      query.assignee = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'username fullName profileImage')
      .populate('createdBy', 'username fullName')
      .sort({ status: 1, order: 1 });

    res.status(200).json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get project tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Validate input
    const validatedData = updateTaskSchema.parse(req.body);

    // Find the task
    const task = await Task.findById(taskId).populate('projectId');
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const project = task.projectId;

    // Check if project is still active
    if (project.projectStatus !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot update tasks in a ${project.projectStatus} project`
      });
    }

    // Check permissions
    const isProjectCreator = project.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();

    if (!isProjectCreator && !isAdmin && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update tasks assigned to you or tasks in your projects.'
      });
    }

    // Developers can only update certain fields
    if (!isProjectCreator && !isAdmin) {
      const allowedFields = ['status', 'description'];
      const updateKeys = Object.keys(validatedData);
      const hasDisallowedFields = updateKeys.some(key => !allowedFields.includes(key));
      
      if (hasDisallowedFields) {
        return res.status(403).json({
          success: false,
          message: 'Developers can only update status and description fields.'
        });
      }
    }

    // If assignee is being updated, validate they are part of the team
    if (validatedData.assignee) {
      const projectWithTeam = await Problem.findById(project._id).populate('teamMembers.user');
      const isTeamMember = projectWithTeam.teamMembers.some(
        member => member.user._id.toString() === validatedData.assignee
      );
      
      if (!isTeamMember) {
        return res.status(400).json({
          success: false,
          message: 'Assignee must be a team member of this project'
        });
      }
    }

    // Handle status change and reordering
    if (validatedData.status && validatedData.status !== task.status) {
      // Get the max order for the new status column
      const lastTaskInNewStatus = await Task.findOne({
        projectId: task.projectId,
        status: validatedData.status
      }).sort({ order: -1 });
      
      validatedData.order = lastTaskInNewStatus ? lastTaskInNewStatus.order + 1 : 0;
    }

    // Update the task
    Object.assign(task, validatedData);
    
    if (validatedData.dueDate) {
      task.dueDate = new Date(validatedData.dueDate);
    }

    await task.save();
    await task.populate(['assignee', 'createdBy', 'projectId']);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Find the task
    const task = await Task.findById(taskId).populate('projectId');
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const project = task.projectId;

    // Check permissions - Only creators and admins can delete tasks
    const isProjectCreator = project.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isProjectCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project creators and admins can delete tasks.'
      });
    }

    await Task.findByIdAndDelete(taskId);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reorder tasks within a column
const reorderTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tasks } = req.body; // Array of { taskId, order }

    // Check if project exists and user has permission
    const project = await Problem.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isProjectCreator = project.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isProjectCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project creators and admins can reorder tasks.'
      });
    }

    // Update task orders
    const updatePromises = tasks.map(({ taskId, order }) =>
      Task.findByIdAndUpdate(taskId, { order })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Tasks reordered successfully'
    });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
  reorderTasks
};
