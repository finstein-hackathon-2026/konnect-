const Job = require("../models/Job");

// ─────────────────────────────────────────────────────────
//  Helper: get the socketManager stored on app by server.js
// ─────────────────────────────────────────────────────────
function getSocket(req) {
  return req.app.get("socketManager");
}

// ──────────────────────────────────────────────
//  POST /api/jobs — create a new service job
// ──────────────────────────────────────────────
exports.createJob = async (req, res) => {
  try {
    const { userId, service, description } = req.body;

    if (!userId || !service || !description) {
      return res.status(400).json({
        success: false,
        message: "userId, service, and description are required",
      });
    }

    const job = await Job.create({ userId, service, description });

    // ── Real-time: notify all connected workers about the new job ──
    const sm = getSocket(req);
    if (sm) sm.emitToAllWorkers("new_job", job);

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
//  GET /api/jobs/:id — get a single job
// ──────────────────────────────────────────────
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
//  GET /api/jobs — list jobs
//    Query filters: ?status=pending  ?userId=abc123  ?workerId=xyz
// ──────────────────────────────────────────────
exports.getJobs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.workerId) filter.workerId = req.query.workerId;

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();

    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
//  PATCH /api/jobs/:id — partial update (status, worker assignment, etc.)
//
//  Status transitions are validated:
//    pending → assigned → on_the_way → arrived → verified → completed
// ──────────────────────────────────────────────
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const { status, workerId, workerName, service, description } = req.body;

    // ── Validate status transition ──
    if (status && status !== job.status) {
      if (!Job.isValidTransition(job.status, status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition: "${job.status}" → "${status}". Expected next status: "${Job.TRANSITIONS[job.status] || "none (already completed)"}"`,
        });
      }
      job.status = status;
    }

    // ── Apply other allowed fields ──
    if (workerId !== undefined) job.workerId = workerId;
    if (workerName !== undefined) job.workerName = workerName;
    if (service !== undefined) job.service = service;
    if (description !== undefined) job.description = description;

    await job.save();

    // ── Real-time: push update to the specific user AND assigned worker ──
    const sm = getSocket(req);
    if (sm) {
      const payload = job.toObject();

      // Always notify the job owner (user)
      sm.emitToUser(job.userId, "job_updated", payload);

      // Also notify the assigned worker (if one exists)
      if (job.workerId) {
        sm.emitToWorker(job.workerId, "job_updated", payload);
      }
    }

    res.json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
