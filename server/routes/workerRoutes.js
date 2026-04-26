const express = require("express");
const router = express.Router();
const {
  getAvailableJobs,
  getMyJobs,
  acceptJob,
  updateStatus,
} = require("../controllers/workerController");

// GET    /api/worker/jobs/available      → pending jobs a worker can pick up
router.get("/jobs/available", getAvailableJobs);

// GET    /api/worker/jobs/my?workerId=x  → jobs assigned to this worker
router.get("/jobs/my", getMyJobs);

// PATCH  /api/worker/jobs/:id/accept     → accept a pending job
router.patch("/jobs/:id/accept", acceptJob);

// PATCH  /api/worker/jobs/:id/status     → advance job status
router.patch("/jobs/:id/status", updateStatus);

module.exports = router;
