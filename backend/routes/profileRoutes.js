const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getProfile, updateProfile } = require("../controllers/profileController");

const router = express.Router();

router.get("/me", protect, getProfile);
router.patch("/me", protect, updateProfile);

module.exports = router;
