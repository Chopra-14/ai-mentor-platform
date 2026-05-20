const User = require("../models/User");
const Quiz = require("../models/Quiz");

const generateQuiz = async (req, res) => {
  try {
    const { userId, domain } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    let difficulty = user.difficulty_level;

    let prompt = "";

    if (difficulty === "Beginner") {
      prompt = `Generate beginner level ${domain} interview questions`;
    }

    if (difficulty === "Intermediate") {
      prompt = `Generate intermediate level ${domain} interview questions`;
    }

    if (difficulty === "Advanced") {
      prompt = `Generate advanced level ${domain} interview questions because the user consistently scores above 85%`;
    }

    const sampleQuestions = [
      "Explain REST API",
      "What is Docker?",
      "What is JWT authentication?",
      "Explain MongoDB",
      "What is CI/CD?"
    ];

    const quiz = await Quiz.create({
      user: user._id,
      domain,
      difficulty,
      questions: sampleQuestions.map((q) => ({
        question: q
      }))
    });

    res.status(200).json({
      message: "Quiz generated successfully",
      difficulty,
      ai_prompt: prompt,
      quiz
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const updatePerformance = async (req, res) => {
  try {
    const {
      userId,
      average_score,
      weak_topics
    } = req.body;

    let difficulty_level = "Beginner";

    if (average_score >= 80) {
      difficulty_level = "Advanced";
    } else if (average_score >= 50) {
      difficulty_level = "Intermediate";
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        average_score,
        weak_topics,
        difficulty_level
      },
      {
        new: true
      }
    );

    res.status(200).json({
      message: "Performance updated",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const evaluateAnswer = async (req, res) => {
  try {

    const {
      quizId,
      questionIndex,
      user_answer
    } = req.body;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    const question = quiz.questions[questionIndex];

    let score = 0;

    let feedback = "";

    if (user_answer.length > 20) {
      score = 8;

      feedback = `
Strengths:
- Good explanation provided
- Answer has proper detail

Improvements:
- Add more technical depth
- Include real-world examples
`;
    } else {
      score = 4;

      feedback = `
Strengths:
- Attempted the question

Improvements:
- Provide more detailed explanation
- Add technical concepts
`;
    }

    question.user_answer = user_answer;

    question.ai_feedback = feedback;

    question.score = score;

    await quiz.save();

    const totalScore = quiz.questions.reduce(
      (sum, q) => sum + q.score,
      0
    );

    const average_score =
      totalScore / quiz.questions.length;

    res.status(200).json({
      message: "Answer evaluated successfully",
      score,
      feedback,
      average_score
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  generateQuiz,
  updatePerformance,
  evaluateAnswer
};
