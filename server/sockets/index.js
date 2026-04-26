const Job = require("../models/Job");

/**
 * SocketManager
 *
 * Maintains bidirectional identity maps:
 *   userId   → socketId   (client/user app)
 *   workerId → socketId   (worker app)
 *
 * Exposes targeted emit helpers that controllers call through
 *   req.app.get("socketManager")
 */
class SocketManager {
  constructor(io) {
    this.io = io;

    // Identity → socketId
    this.userSockets = new Map();   // userId   → socketId
    this.workerSockets = new Map(); // workerId → socketId

    // Reverse: socketId → { id, role }
    this.socketIdentity = new Map();
  }

  // ─────────────────────────────────────
  //  Registration helpers
  // ─────────────────────────────────────
  registerUser(socketId, userId) {
    this.userSockets.set(userId, socketId);
    this.socketIdentity.set(socketId, { id: userId, role: "user" });
    console.log(`👤  User registered: ${userId} → ${socketId}`);
  }

  registerWorker(socketId, workerId) {
    this.workerSockets.set(workerId, socketId);
    this.socketIdentity.set(socketId, { id: workerId, role: "worker" });
    // Join the shared "workers" room for broadcast-to-all-workers
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) socket.join("workers");
    console.log(`🔧  Worker registered: ${workerId} → ${socketId}`);
  }

  unregister(socketId) {
    const identity = this.socketIdentity.get(socketId);
    if (!identity) return;

    if (identity.role === "user") {
      this.userSockets.delete(identity.id);
      console.log(`👤  User unregistered: ${identity.id}`);
    } else {
      this.workerSockets.delete(identity.id);
      console.log(`🔧  Worker unregistered: ${identity.id}`);
    }
    this.socketIdentity.delete(socketId);
  }

  // ─────────────────────────────────────
  //  Targeted emit helpers
  // ─────────────────────────────────────

  /** Send an event to a specific user by userId */
  emitToUser(userId, event, data) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  /** Send an event to a specific worker by workerId */
  emitToWorker(workerId, event, data) {
    const socketId = this.workerSockets.get(workerId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  /** Broadcast an event to ALL connected workers */
  emitToAllWorkers(event, data) {
    this.io.to("workers").emit(event, data);
  }

  /** Broadcast to everyone */
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  /** Get current connection stats */
  getStats() {
    return {
      usersOnline: this.userSockets.size,
      workersOnline: this.workerSockets.size,
      totalSockets: this.socketIdentity.size,
    };
  }
}

// ─────────────────────────────────────────────
//  Register all Socket.io event listeners
// ─────────────────────────────────────────────
function registerSocketHandlers(io) {
  const manager = new SocketManager(io);

  io.on("connection", (socket) => {
    console.log(`🔌  Client connected: ${socket.id}`);

    // ─────────────────────────────────
    //  REGISTER — client identifies itself
    //  data: { userId, role: "user" | "worker" }
    // ─────────────────────────────────
    socket.on("register", (data) => {
      if (!data || !data.userId || !data.role) return;

      if (data.role === "worker") {
        manager.registerWorker(socket.id, data.userId);
      } else {
        manager.registerUser(socket.id, data.userId);
      }

      // Acknowledge back to the client
      socket.emit("registered", {
        socketId: socket.id,
        ...manager.getStats(),
      });
    });

    // ─────────────────────────────────
    //  ACCEPT_JOB — worker accepts a pending job
    //  data: { jobId, workerId, workerName }
    // ─────────────────────────────────
    socket.on("accept_job", async (data) => {
      try {
        const { jobId, workerId, workerName } = data;
        if (!jobId || !workerId || !workerName) return;

        const job = await Job.findById(jobId);
        if (!job || job.status !== "pending") {
          socket.emit("error_msg", {
            message: job ? "Job is no longer pending" : "Job not found",
          });
          return;
        }

        // Transition: pending → assigned
        job.status = "assigned";
        job.workerId = workerId;
        job.workerName = workerName;
        await job.save();

        const payload = job.toObject();

        // Notify the job-posting user
        manager.emitToUser(job.userId, "job_updated", payload);

        // Confirm to the accepting worker
        socket.emit("job_accepted", payload);

        console.log(
          `✅  Job ${jobId} accepted by worker ${workerId} (${workerName})`
        );
      } catch (err) {
        socket.emit("error_msg", { message: err.message });
      }
    });

    // ─────────────────────────────────
    //  UPDATE_STATUS — worker advances job status
    //  data: { jobId, status }
    // ─────────────────────────────────
    socket.on("update_status", async (data) => {
      try {
        const { jobId, status } = data;
        if (!jobId || !status) return;

        const job = await Job.findById(jobId);
        if (!job) {
          socket.emit("error_msg", { message: "Job not found" });
          return;
        }

        // Validate transition
        if (!Job.isValidTransition(job.status, status)) {
          socket.emit("error_msg", {
            message: `Invalid transition: "${job.status}" → "${status}". Next valid: "${Job.TRANSITIONS[job.status] || "none"}"`,
          });
          return;
        }

        job.status = status;
        await job.save();

        const payload = job.toObject();

        // Notify the job-posting user
        manager.emitToUser(job.userId, "job_updated", payload);

        // Confirm back to the worker
        socket.emit("job_updated", payload);

        console.log(`📡  Job ${jobId} status → ${status}`);
      } catch (err) {
        socket.emit("error_msg", { message: err.message });
      }
    });

    // ─────────────────────────────────
    //  DISCONNECT — clean up maps
    // ─────────────────────────────────
    socket.on("disconnect", (reason) => {
      manager.unregister(socket.id);
      console.log(`❌  Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return manager;
}

module.exports = registerSocketHandlers;
