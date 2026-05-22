const User = require("../models/User");
const Quiz = require("../models/Quiz");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all quizzes for user
    const quizzes = await Quiz.find({ user: userId }).sort({ createdAt: -1 });

    let totalScore = 0;
    let totalQuestions = 0;
    const domainStats = {};
    
    quizzes.forEach(quiz => {
      let quizScore = 0;
      quiz.questions.forEach(q => {
        quizScore += q.score || 0;
        totalQuestions++;
      });
      totalScore += quizScore;

      // Track domain scores
      if (!domainStats[quiz.domain]) {
        domainStats[quiz.domain] = { total: 0, count: 0 };
      }
      domainStats[quiz.domain].total += quizScore;
      domainStats[quiz.domain].count += quiz.questions.length;
    });

    const overallAccuracy = totalQuestions > 0 ? (totalScore / (totalQuestions * 10)) * 100 : 0; // Assuming max score per question is 10
    
    // Find weakest topic
    let weakestTopic = "None";
    let lowestAccuracy = 100;
    
    for (const [domain, stats] of Object.entries(domainStats)) {
      const accuracy = (stats.total / (stats.count * 10)) * 100;
      if (accuracy < lowestAccuracy) {
        lowestAccuracy = accuracy;
        weakestTopic = domain;
      }
    }

    // Update user's weak topics based on real data
    if (weakestTopic !== "None" && !user.weak_topics.includes(weakestTopic)) {
      user.weak_topics = [weakestTopic];
      await user.save();
    }

    // Calculate mock streak
    const streak = Math.floor(Math.random() * 10) + 1; // Simplified streak logic for now

    res.status(200).json({
      overallAccuracy: overallAccuracy.toFixed(2),
      weakestTopic,
      streak,
      domainStats,
      recentQuizzes: quizzes.slice(0, 5) // Last 5 quizzes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
