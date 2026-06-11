const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { getAdminOverview } = require("../controllers/adminController");

const router = express.Router();

router.get("/overview", protect, adminOnly, getAdminOverview);

module.exports = router;
