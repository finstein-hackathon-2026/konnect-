/**
 * KoNNecT Socket Client
 *
 * Reusable Socket.io client module for user/worker apps.
 * Works in browser (vanilla JS, React, React Native via socket.io-client).
 *
 * Usage:
 *   const client = new KonnectSocket("http://localhost:5000");
 *   client.registerAsUser("user123");
 *   client.onJobUpdated((job) => updateUI(job));
 */
class KonnectSocket {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.listeners = {};
    this.isConnected = false;
    this.role = null;
    this.userId = null;
  }

  // ─────────────────────────────────────
  //  Connection
  // ─────────────────────────────────────

  connect() {
    if (this.socket) return this;

    this.socket = io(this.serverUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("[KonnectSocket] Connected:", this.socket.id);
      this._emit("connection", { socketId: this.socket.id });

      // Re-register on reconnect
      if (this.userId && this.role) {
        this.socket.emit("register", { userId: this.userId, role: this.role });
      }
    });

    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      console.log("[KonnectSocket] Disconnected:", reason);
      this._emit("disconnection", { reason });
    });

    this.socket.on("registered", (data) => {
      console.log("[KonnectSocket] Registered:", data);
      this._emit("registered", data);
    });

    this.socket.on("error_msg", (data) => {
      console.error("[KonnectSocket] Error:", data.message);
      this._emit("error", data);
    });

    return this;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // ─────────────────────────────────────
  //  Registration
  // ─────────────────────────────────────

  registerAsUser(userId) {
    this.userId = userId;
    this.role = "user";
    if (this.socket) {
      this.socket.emit("register", { userId, role: "user" });
    }
    return this;
  }

  registerAsWorker(workerId) {
    this.userId = workerId;
    this.role = "worker";
    if (this.socket) {
      this.socket.emit("register", { userId: workerId, role: "worker" });
    }
    return this;
  }

  // ─────────────────────────────────────
  //  User: Listen for updates
  // ─────────────────────────────────────

  /** Called when any job this user owns is updated */
  onJobUpdated(callback) {
    this._on("job_updated", callback);
    if (this.socket) {
      this.socket.on("job_updated", (job) => {
        this._emit("job_updated", job);
      });
    }
    return this;
  }

  // ─────────────────────────────────────
  //  Worker: Listen + Actions
  // ─────────────────────────────────────

  /** Called when a new job is posted (worker only) */
  onNewJob(callback) {
    this._on("new_job", callback);
    if (this.socket) {
      this.socket.on("new_job", (job) => {
        this._emit("new_job", job);
      });
    }
    return this;
  }

  /** Worker accepts a pending job */
  acceptJob(jobId, workerId, workerName) {
    if (this.socket) {
      this.socket.emit("accept_job", { jobId, workerId, workerName });
    }
  }

  /** Called when a job accept is confirmed */
  onJobAccepted(callback) {
    this._on("job_accepted", callback);
    if (this.socket) {
      this.socket.on("job_accepted", (job) => {
        this._emit("job_accepted", job);
      });
    }
    return this;
  }

  /** Worker updates job status */
  updateStatus(jobId, status) {
    if (this.socket) {
      this.socket.emit("update_status", { jobId, status });
    }
  }

  // ─────────────────────────────────────
  //  Internal event bus
  // ─────────────────────────────────────

  _on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  _emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(data));
    }
  }

  /** Listen for any internal event */
  on(event, callback) {
    this._on(event, callback);
    return this;
  }
}

// Export for Node.js / bundlers, or attach to window for browsers
if (typeof module !== "undefined" && module.exports) {
  module.exports = KonnectSocket;
}
