const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createStudyPlan,
  analyzeUserResume,
  createCodingChallenges
} = require("../controllers/advancedController");

const router = express.Router();

router.post("/study-plan", protect, createStudyPlan);
router.post("/resume", protect, analyzeUserResume);
router.post("/coding-challenges", protect, createCodingChallenges);

module.exports = router;
