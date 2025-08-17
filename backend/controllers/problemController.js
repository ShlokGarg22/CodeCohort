const Problem = require('../models/Problem');
const { z } = require('zod');

// Validation schema for creating a project-based problem
const createProblemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  category: z.string().min(1, 'Category is required'),
  projectType: z.string().min(1, 'Project type is required'),
  techStack: z.array(z.string()).min(1, 'At least one technology is required'),
  timeEstimate: z.string().min(1, 'Time estimate is required'),
  teamSize: z.string().min(1, 'Team size is required'),
  requirements: z.string().min(1, 'Requirements are required'),
  deliverables: z.string().optional().default(''),
  evaluation: z.string().optional().default(''),
  resources: z.string().optional().default(''),
  tags: z.array(z.string()).default([])
});

// Create a new problem
const createProblem = async (req, res) => {
  try {
    // Check if user is an approved creator
    if (req.user.role !== 'creator' || req.user.creatorStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only approved creators can create problems.'
      });
    }

    // Validate input
    const validatedData = createProblemSchema.parse(req.body);

    // Check if a problem with the same title already exists
    const existingProblem = await Problem.findOne({ title: validatedData.title });
    if (existingProblem) {
      return res.status(400).json({
        success: false,
        message: 'A problem with this title already exists'
      });
    }

    // Create new problem
    const problem = new Problem({
      ...validatedData,
      createdBy: req.user._id,
      maxTeamSize: parseInt(validatedData.teamSize.split('-')[1]) || 5, // Extract max from "2-5 members"
      currentTeamSize: 1,
      teamMembers: [{
        user: req.user._id,
        role: 'creator'
      }]
    });

    await problem.save();

    // Add to user's joined projects
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        joinedProjects: {
          project: problem._id,
          role: 'creator'
        }
      }
    });

    // Populate creator info
    await problem.populate('createdBy', 'username fullName');

    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      data: {
        problem
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error.errors || []).map(err => ({
          field: err.path?.join('.') || 'unknown',
          message: err.message || 'Validation failed'
        }))
      });
    }

    console.error('Create problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all problems (with pagination)
const getProblems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { difficulty, category, tags, search } = req.query;

    // Build filter
    let filter = { isActive: true, projectStatus: 'active' };
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (category) {
      filter.category = new RegExp(category, 'i');
    }
    
    if (tags) {
      const tagArray = tags.split(',');
      filter.tags = { $in: tagArray };
    }
    
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const problems = await Problem.find(filter)
      .populate('createdBy', 'username fullName')
      .populate('teamMembers.user', '_id username fullName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Problem.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      problems,
      pagination: {
        currentPage: page,
        totalPages,
        totalProblems: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get a single problem by ID
const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id)
      .populate('createdBy', 'username fullName profileImage')
      .populate('teamMembers.user', 'username fullName profileImage');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access to this project
    const isCreator = problem.createdBy?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isTeamMember = problem.teamMembers?.some(member => 
      member.user._id.toString() === req.user._id.toString()
    );

    if (!isCreator && !isAdmin && !isTeamMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    // If user is not the creator, hide sensitive information
    if (!isCreator && req.user.role !== 'admin') {
      problem.testCases = problem.testCases?.filter(tc => !tc.isHidden) || [];
    }

    res.status(200).json({
      success: true,
      data: problem
    });

  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get problems created by current user
const getMyProblems = async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only creators can view their problems.'
      });
    }

    const problems = await Problem.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        problems
      }
    });

  } catch (error) {
    console.error('Get my problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get problems that current user has joined
const getJoinedProblems = async (req, res) => {
  try {
    // Find problems where the user is a team member
    const problems = await Problem.find({
      'teamMembers.user': req.user._id
    })
    .populate('createdBy', 'username fullName email')
    .populate('teamMembers.user', 'username fullName profileImage')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        problems
      }
    });

  } catch (error) {
    console.error('Get joined problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update a problem (only by creator or admin)
const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own problems.'
      });
    }

    // Validate input
    const validatedData = createProblemSchema.partial().parse(req.body);

    // Update problem
    Object.assign(problem, validatedData);
    await problem.save();

    await problem.populate('createdBy', 'username fullName');

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      data: {
        problem
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error.errors || []).map(err => ({
          field: err.path?.join('.') || 'unknown',
          message: err.message || 'Validation failed'
        }))
      });
    }

    console.error('Update problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete a problem (only by creator or admin)
const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own problems.'
      });
    }

    // Soft delete - set isActive to false
    problem.isActive = false;
    await problem.save();

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully'
    });

  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update GitHub repository for a problem
const updateGitHubRepository = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { url, owner, name, fullName, isLocked } = req.body;

    const problem = await Problem.findById(projectId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the creator
    if (problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project creators can update GitHub repository'
      });
    }

    // Update GitHub repository information
    problem.githubRepository = {
      url: url || '',
      owner: owner || '',
      name: name || '',
      fullName: fullName || '',
      isLocked: Boolean(isLocked),
      lockedAt: isLocked ? new Date() : null
    };

    await problem.save();

    res.status(200).json({
      success: true,
      message: 'GitHub repository updated successfully',
      data: problem.githubRepository
    });

  } catch (error) {
    console.error('Update GitHub repository error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get GitHub repository for a problem
const getGitHubRepository = async (req, res) => {
  try {
    const { projectId } = req.params;

    const problem = await Problem.findById(projectId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access (creator, team member, or admin)
    const isCreator = problem.createdBy.toString() === req.user._id.toString();
    const isTeamMember = problem.teamMembers.some(
      member => member.user.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isTeamMember && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: problem.githubRepository
    });

  } catch (error) {
    console.error('Get GitHub repository error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Lock GitHub repository for a problem
const lockGitHubRepository = async (req, res) => {
  try {
    const { projectId } = req.params;

    const problem = await Problem.findById(projectId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the creator
    const isCreator = problem.createdBy.toString() === req.user._id.toString();
    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator can lock the repository'
      });
    }

    // Check if repository exists
    if (!problem.githubRepository || !problem.githubRepository.url) {
      return res.status(400).json({
        success: false,
        message: 'No GitHub repository is linked to this project'
      });
    }

    // Lock the repository
    problem.githubRepository.isLocked = true;
    problem.githubRepository.lockedAt = new Date();
    await problem.save();

    res.status(200).json({
      success: true,
      message: 'GitHub repository locked successfully',
      data: problem.githubRepository
    });

  } catch (error) {
    console.error('Lock GitHub repository error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Unlock GitHub repository for a problem
const unlockGitHubRepository = async (req, res) => {
  try {
    const { projectId } = req.params;

    const problem = await Problem.findById(projectId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the creator
    const isCreator = problem.createdBy.toString() === req.user._id.toString();
    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator can unlock the repository'
      });
    }

    // Check if repository exists
    if (!problem.githubRepository || !problem.githubRepository.url) {
      return res.status(400).json({
        success: false,
        message: 'No GitHub repository is linked to this project'
      });
    }

    // Unlock the repository
    problem.githubRepository.isLocked = false;
    problem.githubRepository.lockedAt = null;
    await problem.save();

    res.status(200).json({
      success: true,
      message: 'GitHub repository unlocked successfully',
      data: problem.githubRepository
    });

  } catch (error) {
    console.error('Unlock GitHub repository error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// End a project (only by creator)
const endProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, status = 'ended' } = req.body;

    const problem = await Problem.findById(id)
      .populate('teamMembers.user', 'username fullName email');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the creator
    if (problem.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator or an admin can end the project'
      });
    }

    // Check if project is already ended
    if (problem.projectStatus !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Project is already ${problem.projectStatus}`
      });
    }

    // Validate status
    const validStatuses = ['completed', 'cancelled', 'ended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project status. Must be completed, cancelled, or ended'
      });
    }

    // Update project status
    problem.projectStatus = status;
    problem.endedAt = new Date();
    problem.endReason = reason || '';
    problem.isActive = false; // Mark as inactive for listing purposes
    await problem.save();

    // Remove project from all team members' joined projects
    const User = require('../models/User');
    const teamMemberIds = problem.teamMembers.map(member => member.user._id);
    
    await User.updateMany(
      { _id: { $in: teamMemberIds } },
      { $pull: { joinedProjects: id } }
    );

    // Remove creator's project reference as well
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { joinedProjects: id } }
    );

    // Clean up pending team requests
    const TeamRequest = require('../models/TeamRequest');
    await TeamRequest.deleteMany({ project: id, status: 'pending' });

    // Optionally, you could also handle tasks cleanup here
    // const Task = require('../models/Task');
    // await Task.updateMany({ projectId: id }, { isActive: false });

    // Send notification to team members via Socket.io
    const io = req.app.get('io');
    if (io) {
      const notificationData = {
        type: 'project_ended',
        projectId: id,
        projectTitle: problem.title,
        status: status,
        reason: reason,
        endedBy: req.user.username,
        timestamp: new Date()
      };

      // Notify all team members
      problem.teamMembers.forEach(member => {
        if (member.user._id.toString() !== req.user._id.toString()) {
          io.to(`user-${member.user._id}`).emit('project-ended', notificationData);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Project ${status} successfully`,
      data: {
        project: {
          _id: problem._id,
          title: problem.title,
          projectStatus: problem.projectStatus,
          endedAt: problem.endedAt,
          endReason: problem.endReason
        }
      }
    });

  } catch (error) {
    console.error('End project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createProblem,
  getProblems,
  getProblemById,
  getMyProblems,
  getJoinedProblems,
  updateProblem,
  deleteProblem,
  updateGitHubRepository,
  getGitHubRepository,
  lockGitHubRepository,
  unlockGitHubRepository,
  endProject
};
