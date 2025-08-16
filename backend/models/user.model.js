const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Clerk Integration
  clerkId: {
    type: String,
    unique: true,
    sparse: true // Allows null values for backward compatibility
  },
  
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.clerkId; // Password not required if using Clerk
    },
    minlength: 6
  },
  
  // Profile Information
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  
  // Professional Information
  currentPosition: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  
  // Academic Information
  batch: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  graduationYear: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  
  // Skills and Experience
  skills: [{
    type: String
  }],
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startYear: Number,
    endYear: Number,
    description: String
  }],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  
  // Social Links
  social: {
    linkedin: String,
    github: String,
    twitter: String,
    website: String
  },
  
  // Privacy Settings
  profileVisibility: {
    type: String,
    enum: ['public', 'private', 'alumni-only'],
    default: 'alumni-only'
  },
  fieldVisibility: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    location: { type: Boolean, default: true },
    company: { type: Boolean, default: true },
    social: { type: Boolean, default: true }
  },
  
  // Connections
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  connectionRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Role and Status
  role: {
    type: String,
    enum: ['student', 'alumni', 'admin'],
    default: 'student'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving (only if password exists)
userSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Index for search functionality
userSchema.index({
  name: 'text',
  company: 'text',
  location: 'text',
  department: 'text',
  batch: 'text'
});

module.exports = mongoose.model('User', userSchema);