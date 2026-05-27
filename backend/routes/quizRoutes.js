const express = require("express");

const router = express.Router();

const {
  generateQuiz,
  evaluateAnswer,
  updatePerformance,
  getQuizzes
} = require("../controllers/quizController");

const { protect } = require("../middleware/authMiddleware");

router.post(
  "/generate",
  protect,
  generateQuiz
);

router.post(
  "/evaluate",
  protect,
  evaluateAnswer
);

router.post(
  "/performance",
  protect,
  updatePerformance
);

router.get(
  "/",
  protect,
  getQuizzes
);

module.exports = router;