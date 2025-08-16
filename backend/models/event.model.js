const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  eventDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  location: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['workshop', 'seminar', 'networking', 'reunion', 'career-fair', 'other'],
    default: 'other'
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  virtualLink: {
    type: String,
    validate: {
      validator: function(v) {
        return !this.isVirtual || (this.isVirtual && v && v.length > 0);
      },
      message: 'Virtual link is required for virtual events'
    }
  },
  maxAttendees: {
    type: Number,
    min: 1
  },
  registrationDeadline: {
    type: Date
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Index for search and filtering
eventSchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  tags: 'text'
});

eventSchema.index({ eventDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ organizer: 1 });

// Virtual for checking if registration is open
eventSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  const deadline = this.registrationDeadline || this.eventDate;
  return this.status === 'published' && now < deadline;
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.maxAttendees && this.attendees.length >= this.maxAttendees;
});

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees.filter(a => a.status === 'registered').length;
});

module.exports = mongoose.model('Event', eventSchema);