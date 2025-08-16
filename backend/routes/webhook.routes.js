const express = require('express');
const router = express.Router();
const { handleClerkWebhook } = require('../controllers/webhook.controller');

// Clerk webhook endpoint
router.post('/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook);

module.exports = router;