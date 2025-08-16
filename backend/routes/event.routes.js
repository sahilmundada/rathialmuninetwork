const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getMyEvents,
  getEventAttendees
} = require('../controllers/event.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes (require authentication)
router.use(requireAuth);

// User routes
router.post('/:id/register', registerForEvent);
router.delete('/:id/register', unregisterFromEvent);
router.get('/my/events', getMyEvents);

// Admin routes
router.post('/', requireAdmin, createEvent);
router.put('/:id', requireAdmin, updateEvent);
router.delete('/:id', requireAdmin, deleteEvent);
router.get('/:id/attendees', requireAdmin, getEventAttendees);

module.exports = router;