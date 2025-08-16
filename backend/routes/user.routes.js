const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes are protected
router.use(authMiddleware.protect);

// Get all users with filters
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Connection management
router.post('/connect/:userId', userController.sendConnectionRequest);
router.post('/accept/:userId', userController.acceptConnectionRequest);
router.post('/reject/:userId', userController.rejectConnectionRequest);
router.delete('/connect/:userId', userController.removeConnection);

// Get user connections
router.get('/connections/me', userController.getUserConnections);
router.get('/connections/:id', userController.getUserConnections);

// Get connection requests
router.get('/requests/pending', userController.getConnectionRequests);

module.exports = router;