const User = require("../models/User");
const Quiz = require("../models/Quiz");

const getProfile = async (req, res) => {

  try {

    const user =
      await User.findById(req.user._id);

    if (!user) {

      return res.status(404).json({
        message: "User not found"
      });

    }

    const quizzes =
      await Quiz.find({
        user: req.user._id
      });

    let totalScore = 0;

    let strongest_topic = "None";

    let highest = 0;

    const topicMap = {};

    quizzes.forEach((quiz) => {

      let quizScore = 0;

      quiz.questions.forEach((q) => {

        quizScore += q.score || 0;

      });

      totalScore += quizScore;

      if (!topicMap[quiz.domain]) {

        topicMap[quiz.domain] = {
          total: 0,
          count: 0
        };

      }

      topicMap[quiz.domain].total += quizScore;

      topicMap[quiz.domain].count +=
        quiz.questions.length;

    });

    Object.keys(topicMap).forEach((topic) => {

      const avg =
        topicMap[topic].total /
        topicMap[topic].count;

      if (avg > highest) {

        highest = avg;

        strongest_topic = topic;

      }

    });

    const average_score =
      quizzes.length > 0
        ? (
            totalScore /
            quizzes.reduce(
              (sum, q) =>
                sum + q.questions.length,
              0
            )
          ) * 10
        : 0;

    res.json({

      name: user.name,

      email: user.email,

      difficulty_level:
        user.difficulty_level ||
        "Beginner",

      average_score:
        average_score.toFixed(1),

      weak_topics:
        user.weak_topics || [],

      total_quizzes:
        quizzes.length,

      strongest_topic,

      streak:
        user.streak || 0,

      domainStats: topicMap

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

module.exports = {
  getProfile
};