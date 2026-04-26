const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateMe,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.route("/").get(getUsers).post(createUser);

// ── Profile Updates ──────────────────────────────
router.patch("/updateMe", protect, updateMe);
router.post("/uploadAvatar", protect, upload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Please upload a file" });
  }
  res.json({
    success: true,
    message: "Avatar uploaded successfully",
    filePath: `/uploads/${req.file.filename}`,
  });
});

router.route("/:id").get(getUser);

module.exports = router;
