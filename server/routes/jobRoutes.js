const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validatorMiddleware");
const {
  createJob,
  getJob,
  getJobs,
  updateJob,
} = require("../controllers/jobController");

// ── Validation Rules ─────────────────────────────
const jobCreateValidation = [
  body("userId").notEmpty().withMessage("userId is required"),
  body("service").trim().notEmpty().withMessage("Service type is required"),
  body("description")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
];

// POST   /api/jobs      → create job
// GET    /api/jobs      → list jobs
router.route("/").post(jobCreateValidation, validate, createJob).get(getJobs);

// GET    /api/jobs/:id  → get single job
// PATCH  /api/jobs/:id  → partial update (status, worker, etc.)
router.route("/:id").get(getJob).patch(updateJob);

module.exports = router;
