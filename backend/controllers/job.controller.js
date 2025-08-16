const Job = require('../models/job.model');
const User = require('../models/user.model');

// Create a new job posting
const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      requirements,
      location,
      jobType,
      workMode,
      experienceLevel,
      salaryRange,
      skills,
      benefits,
      applicationDeadline,
      applicationUrl,
      contactEmail,
      tags
    } = req.body;

    const job = new Job({
      title,
      company,
      description,
      requirements,
      location,
      jobType,
      workMode,
      experienceLevel,
      salaryRange,
      skills,
      benefits,
      applicationDeadline,
      applicationUrl,
      contactEmail,
      postedBy: req.user._id,
      tags,
      status: 'published'
    });

    await job.save();
    await job.populate('postedBy', 'name email company');

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job posting',
      error: error.message
    });
  }
};

// Get all jobs with filtering and pagination
const getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      jobType,
      workMode,
      experienceLevel,
      location,
      company,
      search,
      skills,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { status: 'published', isActive: true };

    // Filter by job type
    if (jobType) {
      filter.jobType = jobType;
    }

    // Filter by work mode
    if (workMode) {
      filter.workMode = workMode;
    }

    // Filter by experience level
    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    // Filter by location
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Filter by company
    if (company) {
      filter.company = { $regex: company, $options: 'i' };
    }

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      filter.skills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email company profilePicture')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

// Get job by ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email company profilePicture currentPosition')
      .populate('applications.applicant', 'name email profilePicture');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment views
    await job.incrementViews();

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
};

// Update job (Job poster or admin only)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is job poster or admin
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email company');

    res.json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error.message
    });
  }
};

// Delete job (Job poster or admin only)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is job poster or admin
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message
    });
  }
};

// Apply for job
const applyForJob = async (req, res) => {
  try {
    const { coverLetter, resumeUrl } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if application is open
    if (!job.isApplicationOpen) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if user has already applied
    const hasApplied = job.applications.some(
      app => app.applicant.toString() === req.user._id.toString()
    );

    if (hasApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Add application
    job.applications.push({
      applicant: req.user._id,
      appliedAt: new Date(),
      status: 'pending',
      coverLetter,
      resumeUrl
    });

    await job.save();

    res.json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// Get user's posted jobs
const getMyJobs = async (req, res) => {
  try {
    const { type = 'posted' } = req.query; // 'posted' or 'applied'

    let jobs;
    if (type === 'applied') {
      // Get jobs user has applied to
      jobs = await Job.find({
        'applications.applicant': req.user._id
      })
        .populate('postedBy', 'name email company')
        .sort({ createdAt: -1 });

      // Add application status to each job
      jobs = jobs.map(job => {
        const application = job.applications.find(
          app => app.applicant.toString() === req.user._id.toString()
        );
        return {
          ...job.toObject(),
          applicationStatus: application ? application.status : null,
          appliedAt: application ? application.appliedAt : null
        };
      });
    } else {
      // Get jobs posted by user
      jobs = await Job.find({ postedBy: req.user._id })
        .populate('postedBy', 'name email company')
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your jobs',
      error: error.message
    });
  }
};

// Get job applications (Job poster or admin only)
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('applications.applicant', 'name email profilePicture company currentPosition');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is job poster or admin
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications'
      });
    }

    res.json({
      success: true,
      applications: job.applications
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job applications',
      error: error.message
    });
  }
};

// Update application status (Job poster or admin only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id: jobId, applicationId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is job poster or admin
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update application status'
      });
    }

    // Find and update application
    const application = job.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;
    await job.save();

    res.json({
      success: true,
      message: 'Application status updated successfully'
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyForJob,
  getMyJobs,
  getJobApplications,
  updateApplicationStatus
};