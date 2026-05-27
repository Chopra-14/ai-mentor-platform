const User = require("../models/User");
const Quiz = require("../models/Quiz");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // All quizzes for this user, newest first
    const quizzes = await Quiz.find({ user: userId }).sort({ createdAt: -1 });
    const total = quizzes.length;

    // ── Per-domain stats ──────────────────────────────
    const domainMap = {};
    quizzes.forEach((quiz) => {
      const domain = quiz.domain;
      if (!domainMap[domain]) domainMap[domain] = { totalScore: 0, count: 0 };

      // Use quiz.totalScore if stored, otherwise sum question scores
      const quizScore =
        quiz.totalScore != null
          ? quiz.totalScore
          : quiz.questions.reduce((a, q) => a + (q.score || 0), 0);

      domainMap[domain].totalScore += quizScore;
      domainMap[domain].count += 1;
    });

    // domainProgress array — score as percentage (0-100)
    const domainProgress = Object.entries(domainMap).map(([domain, data]) => ({
      domain,
      score: Math.min(Math.round((data.totalScore / (data.count * 10)) * 100), 100)
    }));

    // ── Overall accuracy ──────────────────────────────
    const totalScore = quizzes.reduce((a, q) => {
      const s = q.totalScore != null
        ? q.totalScore
        : q.questions.reduce((b, qq) => b + (qq.score || 0), 0);
      return a + s;
    }, 0);
    const accuracy = total > 0
      ? Math.round((totalScore / (total * 10)) * 100)
      : 0;

    // ── Strongest & weakest topic ─────────────────────
    let weakTopic = null;
    let strongestTopic = null;
    let lowestPct = Infinity;
    let highestPct = -Infinity;

    domainProgress.forEach(({ domain, score }) => {
      if (score < lowestPct)  { lowestPct = score;  weakTopic      = domain; }
      if (score > highestPct) { highestPct = score; strongestTopic = domain; }
    });

    // ── Learning level ────────────────────────────────
    const learningLevel =
      accuracy >= 80 ? "Advanced" :
      accuracy >= 50 ? "Intermediate" : "Beginner";

    // ── Interview readiness ───────────────────────────
    const interviewReadiness =
      accuracy >= 80 ? "Ready 🟢" :
      accuracy >= 60 ? "Almost Ready 🟡" :
      accuracy >= 40 ? "In Progress 🟠" : "Starting 🔴";

    // ── Weekly goal (quizzes this week / target 5) ────
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekCount = quizzes.filter(
      (q) => new Date(q.createdAt) >= oneWeekAgo
    ).length;
    const weeklyGoal = Math.min(Math.round((thisWeekCount / 5) * 100), 100);

    // ── Score trend (last 10 quizzes) ─────────────────
    const scoreTrend = quizzes
      .slice(0, 10)
      .reverse()
      .map((q, i) => ({
        quiz: `Q${i + 1}`,
        score: q.totalScore != null
          ? Math.round((q.totalScore / 10) * 100)
          : 0
      }));

    // ── Recommendations based on real data ───────────
    const recommendations = [];
    if (weakTopic) {
      recommendations.push(`Focus on improving your ${weakTopic} skills — it's your weakest area.`);
      recommendations.push(`Practice more ${weakTopic} quizzes to boost your overall score.`);
    }
    if (total === 0) {
      recommendations.push("Take your first quiz to start tracking your progress!");
    } else if (total < 5) {
      recommendations.push("Complete at least 5 quizzes to unlock detailed performance insights.");
    }
    if (accuracy < 60 && total > 0) {
      recommendations.push("Review your answers after each quiz and study topics you got wrong.");
    }
    if (weeklyGoal < 100) {
      recommendations.push(`You've completed ${thisWeekCount}/5 quizzes this week. Keep going to hit your weekly goal!`);
    }
    if (recommendations.length === 0) {
      recommendations.push("Excellent work! Keep practicing to maintain your performance.");
    }

    // ── Save weak topic back to user ──────────────────
    if (weakTopic && !user.weak_topics?.includes(weakTopic)) {
      await User.findByIdAndUpdate(userId, { weak_topics: [weakTopic] });
    }

    // ── Final response — field names match frontend ───
    res.status(200).json({
      // Dashboard page fields
      accuracy,                          // was: overallAccuracy
      totalQuizzes: total,
      weakTopic,                         // was: weakestTopic
      strongestTopic,
      recentQuizzes: quizzes.slice(0, 5),
      weeklyGoal,
      isAdmin:
        user.role === "admin" ||
        (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL),

      // Analytics page fields
      domainProgress,
      learningLevel,
      interviewReadiness,
      scoreTrend,
      recommendations,
      averageScore: accuracy,
      currentStreak: thisWeekCount,
    });

  } catch (error) {
    console.error("getDashboardStats error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };