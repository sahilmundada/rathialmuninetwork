const Event = require('../models/event.model');
const User = require('../models/user.model');

// Create a new event (Admin only)
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventDate,
      endDate,
      location,
      eventType,
      isVirtual,
      virtualLink,
      maxAttendees,
      registrationDeadline,
      tags,
      imageUrl,
      isPublic,
      requiresApproval
    } = req.body;

    const event = new Event({
      title,
      description,
      eventDate,
      endDate,
      location,
      eventType,
      isVirtual,
      virtualLink,
      maxAttendees,
      registrationDeadline,
      organizer: req.user._id,
      tags,
      imageUrl,
      isPublic,
      requiresApproval,
      status: 'published'
    });

    await event.save();
    await event.populate('organizer', 'name email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// Get all events with filtering and pagination
const getAllEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      eventType,
      location,
      search,
      upcoming = 'true',
      isVirtual
    } = req.query;

    const filter = { status: 'published' };

    // Filter by event type
    if (eventType) {
      filter.eventType = eventType;
    }

    // Filter by location
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Filter by virtual/physical
    if (isVirtual !== undefined) {
      filter.isVirtual = isVirtual === 'true';
    }

    // Filter upcoming events
    if (upcoming === 'true') {
      filter.eventDate = { $gte: new Date() };
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .sort({ eventDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEvents: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email profilePicture')
      .populate('attendees.user', 'name email profilePicture');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

// Update event (Admin or organizer only)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// Delete event (Admin or organizer only)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

// Register for event
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registration is open
    if (!event.isRegistrationOpen) {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed for this event'
      });
    }

    // Check if event is full
    if (event.isFull) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Check if user is already registered
    const isAlreadyRegistered = event.attendees.some(
      attendee => attendee.user.toString() === req.user._id.toString()
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Add user to attendees
    event.attendees.push({
      user: req.user._id,
      registeredAt: new Date(),
      status: 'registered'
    });

    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for the event'
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event',
      error: error.message
    });
  }
};

// Unregister from event
const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Remove user from attendees
    event.attendees = event.attendees.filter(
      attendee => attendee.user.toString() !== req.user._id.toString()
    );

    await event.save();

    res.json({
      success: true,
      message: 'Successfully unregistered from the event'
    });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unregister from event',
      error: error.message
    });
  }
};

// Get user's registered events
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({
      'attendees.user': req.user._id,
      'attendees.status': 'registered'
    })
      .populate('organizer', 'name email')
      .sort({ eventDate: 1 });

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your events',
      error: error.message
    });
  }
};

// Get event attendees (Admin or organizer only)
const getEventAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('attendees.user', 'name email profilePicture company currentPosition');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view attendees'
      });
    }

    res.json({
      success: true,
      attendees: event.attendees
    });
  } catch (error) {
    console.error('Get event attendees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event attendees',
      error: error.message
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getMyEvents,
  getEventAttendees
};