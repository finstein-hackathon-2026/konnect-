const User = require("../models/User");

// ──────────────────────────────────────────────
//  GET /api/users — list all users
// ──────────────────────────────────────────────
exports.getUsers = async (_req, res) => {
  try {
    const users = await User.find().lean();
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
//  GET /api/users/:id — single user
// ──────────────────────────────────────────────
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
//  POST /api/users — create a user (placeholder — auth layer later)
// ──────────────────────────────────────────────
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
//  PATCH /api/users/updateMe
// ──────────────────────────────────────────────
exports.updateMe = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

