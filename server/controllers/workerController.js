const Job = require("../models/Job");

// ─────────────────────────────────────────────────────────
//  Helper: get the socketManager stored on app by server.js
// ─────────────────────────────────────────────────────────
function getSocket(req) {
  return req.app.get("socketManager");
}

// ──────────────────────────────────────────────
//  GET /api/worker/jobs/available
//  Returns all pending jobs a worker can pick up
// ──────────────────────────────────────────────
exports.getAvailableJobs = async (_req, res) => {
  try {
    const jobs = await Job.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
//  GET /api/worker/jobs/my?workerId=xxx
//  Returns all jobs assigned to this worker
// ──────────────────────────────────────────────
exports.getMyJobs = async (req, res) => {
  try {
    const { workerId } = req.query;

    if (!workerId) {
      return res
        .status(400)
        .json({ success: false, message: "workerId query param is required" });
    }

    const jobs = await Job.find({ workerId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
//  PATCH /api/worker/jobs/:id/accept
//  Worker accepts a pending job
//
//  Body: { workerId, workerName }
//  Result: status → "assigned", workerId + workerName set
//  Emits: "job_updated" → job owner (user)
// ──────────────────────────────────────────────
exports.acceptJob = async (req, res) => {
  try {
    const { workerId, workerName } = req.body;

    if (!workerId || !workerName) {
      return res.status(400).json({
        success: false,
        message: "workerId and workerName are required",
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: `Job cannot be accepted — current status is "${job.status}"`,
      });
    }

    // Transition: pending → assigned
    job.status = "assigned";
    job.workerId = workerId;
    job.workerName = workerName;
    await job.save();

    const payload = job.toObject();

    // ── Real-time: notify the job-posting user ──
    const sm = getSocket(req);
    if (sm) {
      sm.emitToUser(job.userId, "job_updated", payload);
    }

    res.json({ success: true, data: payload });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
//  PATCH /api/worker/jobs/:id/status
//  Worker advances a job through the status pipeline
//
//  Body: { status }
//  Valid transitions:
//    assigned → on_the_way → arrived → verified → completed
//
//  Emits: "job_updated" → job owner (user) + assigned worker
// ──────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "status is required" });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Enforce linear status flow
    if (!Job.isValidTransition(job.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition: "${job.status}" → "${status}". Next valid status: "${Job.TRANSITIONS[job.status] || "none (already completed)"}"`,
      });
    }

    job.status = status;
    await job.save();

    const payload = job.toObject();

    // ── Real-time: notify user + worker ──
    const sm = getSocket(req);
    if (sm) {
      sm.emitToUser(job.userId, "job_updated", payload);
      if (job.workerId) {
        sm.emitToWorker(job.workerId, "job_updated", payload);
      }
    }

    res.json({ success: true, data: payload });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
