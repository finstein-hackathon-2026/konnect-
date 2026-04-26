const mongoose = require("mongoose");

/**
 * Valid status transitions for the service marketplace job lifecycle.
 *
 *   pending → assigned → on_the_way → arrived → verified → completed
 */
const JOB_STATUSES = [
  "pending",
  "assigned",
  "on_the_way",
  "arrived",
  "verified",
  "completed",
];

const jobSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "userId is required"],
    index: true,
  },
  service: {
    type: String,
    required: [true, "Service type is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    maxlength: 2000,
  },
  status: {
    type: String,
    enum: {
      values: JOB_STATUSES,
      message: "{VALUE} is not a valid status",
    },
    default: "pending",
    index: true,
  },
  workerId: {
    type: String,
    default: null,
  },
  workerName: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for fast listing queries
jobSchema.index({ userId: 1, status: 1 });

// ── Static: allowed status transitions ────────
jobSchema.statics.STATUSES = JOB_STATUSES;

jobSchema.statics.TRANSITIONS = {
  pending: "assigned",
  assigned: "on_the_way",
  on_the_way: "arrived",
  arrived: "verified",
  verified: "completed",
};

/**
 * Check whether moving from `from` → `to` is a legal transition.
 */
jobSchema.statics.isValidTransition = function (from, to) {
  return this.TRANSITIONS[from] === to;
};

module.exports = mongoose.model("Job", jobSchema);
