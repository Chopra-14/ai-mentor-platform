const User = require("../models/User");
const Quiz = require("../models/Quiz");
const { generateQuizQuestions, evaluateUserAnswer } = require("../services/aiService");

const generateQuiz = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.body.userId;
    const { domain } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    let difficulty = user.difficulty_level || "Beginner";
    
    // Use AI to generate real questions dynamically
    const generatedQuestions = await generateQuizQuestions(domain, difficulty);

    const quiz = await Quiz.create({
      user: user._id,
      domain,
      difficulty,
      questions: generatedQuestions.map((q) => ({
        question: q
      }))
    });

    res.status(200).json({
      message: "Quiz generated successfully",
      difficulty,
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
    const userId = req.user ? req.user._id : req.body.userId;
    const {
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

    // Use AI to evaluate user answer
    const evaluation = await evaluateUserAnswer(question.question, user_answer);

    question.user_answer = user_answer;
    question.ai_feedback = evaluation.feedback;
    question.score = evaluation.score;

    await quiz.save();

    const totalScore = quiz.questions.reduce(
      (sum, q) => sum + (q.score || 0),
      0
    );

    const average_score = totalScore / quiz.questions.length;
    const allAnswered = quiz.questions.every((q) => q.user_answer);

    if (allAnswered && req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        let difficulty_level = "Beginner";
        if (average_score >= 8) difficulty_level = "Advanced";
        else if (average_score >= 5) difficulty_level = "Intermediate";

        user.average_score = average_score * 10;
        user.difficulty_level = difficulty_level;
        if (quiz.domain && !user.weak_topics.includes(quiz.domain) && average_score < 6) {
          user.weak_topics = [quiz.domain, ...user.weak_topics].slice(0, 5);
        }
        await user.save();
      }
    }

    res.status(200).json({
      message: "Answer evaluated successfully",
      score: evaluation.score,
      feedback: evaluation.feedback,
      average_score,
      quizComplete: allAnswered
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getQuizzes = async (req, res) => {
  try {
    // If a userId is passed in params, use it, otherwise use JWT user
    const userId = req.params.userId && req.params.userId !== "USER_ID" ? req.params.userId : req.user._id;
    
    const quizzes = await Quiz.find({ user: userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      message: "Quizzes fetched successfully",
      count: quizzes.length,
      quizzes
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
  evaluateAnswer,
  getQuizzes
};
