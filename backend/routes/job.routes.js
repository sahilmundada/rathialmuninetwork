const express = require('express');
const router = express.Router();
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyForJob,
  getMyJobs,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/job.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected routes (require authentication)
router.use(requireAuth);

// User routes
router.post('/', createJob); // Alumni can post jobs
router.post('/:id/apply', applyForJob);
router.get('/my/jobs', getMyJobs);

// Job poster/Admin routes
router.put('/:id', updateJob); // Only job poster or admin can update
router.delete('/:id', deleteJob); // Only job poster or admin can delete
router.get('/:id/applications', getJobApplications); // Only job poster or admin can view applications
router.put('/:id/applications/:applicationId', updateApplicationStatus); // Update application status

module.exports = router;