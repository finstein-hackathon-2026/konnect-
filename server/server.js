require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const registerSocketHandlers = require("./sockets");

// ── Route imports ────────────────────────────
const jobRoutes = require("./routes/jobRoutes");
const userRoutes = require("./routes/userRoutes");
const workerRoutes = require("./routes/workerRoutes");
const authRoutes = require("./routes/authRoutes");

// ── App & Server ─────────────────────────────
const app = express();
const server = http.createServer(app);

// ── Socket.io ────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

// Store io on app (raw access if needed)
app.set("io", io);

// Register socket event handlers — returns a SocketManager instance
// with userId→socketId and workerId→socketId maps + targeted emit helpers
const socketManager = registerSocketHandlers(io);
app.set("socketManager", socketManager);

// ── Middleware ────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Static files (Built React App) ─────────────
app.use(express.static(path.join(__dirname, "../client/dist")));
// Keep the old public for other assets if needed
app.use(express.static(path.join(__dirname, "public")));

// ── Catch-all: Send React index.html for non-API routes ──
app.get("*all", (req, res, next) => {
  // If it's an API request, let it fall through to the API routes/404 handler
  if (req.url.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// ── API Routes ───────────────────────────────
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/auth", authRoutes);

// ── 404 handler ──────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ─────────────────────
app.use((err, _req, res, _next) => {
  console.error("💥  Unhandled error:", err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ── Start ────────────────────────────────────
const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`\n🚀  KoNNecT server running on http://localhost:${PORT}`);
    console.log(`🔌  Socket.io ready on ws://localhost:${PORT}`);
    console.log(`📦  Environment: ${process.env.NODE_ENV || "development"}\n`);
  });
})();
