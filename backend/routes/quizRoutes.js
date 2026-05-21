const express = require("express");
const router = express.Router();

const Quiz = require("../models/Quiz");

router.post("/generate", async (req, res) => {

  try {

    const quiz = new Quiz({
      userId: req.body.userId,
      domain: req.body.domain,

      questions: [
        {
          question: "What is Docker?",
          answer: "Containerization platform"
        },
        {
          question: "Explain JWT",
          answer: "Authentication token"
        }
      ],

      totalScore: 0
    });

    await quiz.save();

    res.json({
      message: "Quiz generated successfully",
      quiz
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

module.exports = router;