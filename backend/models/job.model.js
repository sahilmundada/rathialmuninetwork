const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  requirements: {
    type: String,
    required: true,
    maxlength: 3000
  },
  location: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    required: true
  },
  workMode: {
    type: String,
    enum: ['remote', 'on-site', 'hybrid'],
    default: 'on-site'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive'],
    required: true
  },
  salaryRange: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  applicationDeadline: {
    type: Date
  },
  applicationUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Application URL must be a valid URL'
    }
  },
  contactEmail: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Contact email must be a valid email address'
    }
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
      default: 'pending'
    },
    coverLetter: {
      type: String,
      maxlength: 2000
    },
    resumeUrl: {
      type: String
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'filled'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Index for search and filtering
jobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  location: 'text',
  skills: 'text'
});

jobSchema.index({ jobType: 1 });
jobSchema.index({ workMode: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ createdAt: -1 });

// Virtual for checking if application deadline has passed
jobSchema.virtual('isApplicationOpen').get(function() {
  if (!this.applicationDeadline) return this.status === 'published';
  return this.status === 'published' && new Date() < this.applicationDeadline;
});

// Virtual for application count
jobSchema.virtual('applicationCount').get(function() {
  return this.applications.length;
});

// Method to increment views
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema);