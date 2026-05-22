const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { generateQuiz, updatePerformance, evaluateAnswer, getQuizzes } = require("../controllers/quizController");

router.post("/generate", protect, generateQuiz);
router.post("/performance", protect, updatePerformance);
router.post("/evaluate", protect, evaluateAnswer);
router.get("/", protect, getQuizzes);
router.get("/:userId", protect, getQuizzes);

module.exports = router;