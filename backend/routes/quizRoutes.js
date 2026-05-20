const express = require("express");

const {
  generateQuiz,
  updatePerformance,
  evaluateAnswer
} = require("../controllers/quizController");

const router = express.Router();
router.put("/performance", updatePerformance);
router.post("/evaluate", evaluateAnswer);

router.post("/generate", generateQuiz);

module.exports = router;