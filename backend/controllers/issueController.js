const Issue = require('../models/Issue');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
  try {
    const { title, description, category, location, address } = req.body;

    // Upload images to cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'issue-tracker',
          transformation: [{ width: 800, height: 600, crop: 'limit' }]
        });
        
        images.push({
          url: result.secure_url,
          publicId: result.public_id
        });

        // Remove file from server
        fs.unlinkSync(file.path);
      }
    }

    // Parse location coordinates
    const coordinates = location.split(',').map(coord => parseFloat(coord));

    const issue = await Issue.create({
      title,
      description,
      category,
      location: {
        type: 'Point',
        coordinates,
        address
      },
      images,
      createdBy: req.user.id
    });

    // Populate user details
    await issue.populate('createdBy', 'name email avatar');

    // Emit socket event
    const io = req.app.get('io');
    io.emit('new-issue', issue);

    res.status(201).json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all issues with filters
// @route   GET /api/issues
// @access  Public
const getIssues = async (req, res) => {
  try {
    const { status, category, near, radius = 10, page = 1, limit = 10 } = req.query;
    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Geo-location search
    if (near) {
      const [lng, lat] = near.split(',').map(coord => parseFloat(coord));
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radius * 1000 // Convert to meters
        }
      };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const issues = await Issue.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Issue.countDocuments(query);

    res.status(200).json({
      success: true,
      count: issues.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: issues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Public
const getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email role avatar');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Increment views
    issue.views += 1;
    await issue.save();

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update issue status
// @route   PUT /api/issues/:id/status
// @access  Private (Officials/Admin)
const updateStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Update status
    issue.status = status;
    
    // Add official comment if provided
    if (comment) {
      issue.comments.push({
        user: req.user.id,
        text: comment,
        isOfficial: true
      });
    }

    // If resolved, set resolved date
    if (status === 'resolved') {
      issue.resolvedAt = Date.now();
    }

    // If in-progress and not assigned, assign to current official
    if (status === 'in-progress' && !issue.assignedTo) {
      issue.assignedTo = req.user.id;
    }

    await issue.save();
    await issue.populate('assignedTo', 'name email');
    await issue.populate('comments.user', 'name email role');

    // Emit socket event
    const io = req.app.get('io');
    io.emit('issue-updated', {
      issueId: issue._id,
      status: issue.status,
      issue
    });

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upvote issue
// @route   POST /api/issues/:id/upvote
// @access  Private
const upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user already upvoted
    const hasUpvoted = issue.upvotes.includes(req.user.id);

    if (hasUpvoted) {
      // Remove upvote
      issue.upvotes = issue.upvotes.filter(
        id => id.toString() !== req.user.id.toString()
      );
    } else {
      // Add upvote
      issue.upvotes.push(req.user.id);
    }

    await issue.save();

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.emit('upvote-updated', {
      issueId: issue._id,
      upvotes: issue.upvotes.length
    });

    res.status(200).json({
      success: true,
      upvotes: issue.upvotes.length,
      hasUpvoted: !hasUpvoted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add comment to issue
// @route   POST /api/issues/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    const comment = {
      user: req.user.id,
      text,
      isOfficial: req.user.role === 'official' || req.user.role === 'admin'
    };

    issue.comments.push(comment);
    await issue.save();

    await issue.populate('comments.user', 'name email role avatar');
    const newComment = issue.comments[issue.comments.length - 1];

    // Emit socket event
    const io = req.app.get('io');
    io.emit('new-comment', {
      issueId: issue._id,
      comment: newComment
    });

    res.status(200).json({
      success: true,
      data: newComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's issues
// @route   GET /api/issues/user/me
// @access  Private
const getUserIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssue,
  updateStatus,
  upvoteIssue,
  addComment,
  getUserIssues
};