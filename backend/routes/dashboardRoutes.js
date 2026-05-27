const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getDashboardStats } = require("../controllers/dashboardController");

// ✅ This is what the frontend calls: GET /api/dashboard/stats
router.get("/stats", protect, getDashboardStats);

module.exports = router;