const User = require("../models/User");
const Quiz = require("../models/Quiz");
const Recommendation = require("../models/Recommendation");

const getAdminOverview = async (req, res) => {
  try {
    const [userCount, quizCount, recommendationCount, users, recentQuizzes] =
      await Promise.all([
        User.countDocuments(),
        Quiz.countDocuments(),
        Recommendation.countDocuments(),
        User.find()
          .select("-password")
          .sort({ createdAt: -1 })
          .limit(50),
        Quiz.find()
          .populate("user", "name email")
          .sort({ createdAt: -1 })
          .limit(20)
      ]);

    const allQuizzes = await Quiz.find();
    let totalScore = 0;
    let totalQuestions = 0;
    const domainCounts = {};

    allQuizzes.forEach((quiz) => {
      domainCounts[quiz.domain] = (domainCounts[quiz.domain] || 0) + 1;
      quiz.questions.forEach((q) => {
        totalScore += q.score || 0;
        totalQuestions++;
      });
    });

    const platformAccuracy =
      totalQuestions > 0
        ? ((totalScore / (totalQuestions * 10)) * 100).toFixed(2)
        : "0";

    const signupsByDay = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 14 }
    ]);

    res.status(200).json({
      userCount,
      quizCount,
      recommendationCount,
      platformAccuracy,
      domainCounts,
      signupsByDay: signupsByDay.reverse(),
      users,
      recentQuizzes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminOverview };
