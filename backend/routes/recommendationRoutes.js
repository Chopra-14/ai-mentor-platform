const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Recommendation = require("../models/Recommendation");
const { sendRecommendationEmail } = require("../services/emailService");
const { protect } = require("../middleware/authMiddleware");

// ✅ FIX — require moved to top of file (not inside async function)
const { generateRecommendations } = require("../services/aiService");

router.post("/generate", protect, async (req, res) => {
  try {
    // ✅ FIX — Always use req.user._id (protect guarantees it exists)
    // Removed req.body.userId fallback — that was a security risk
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const weakTopic = user.weak_topics?.[0] || "System Design";

    const recommendations = await generateRecommendations(weakTopic);

    const recommendation = await Recommendation.create({
      user: userId,
      weak_topic: weakTopic,
      recommendations
    });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await sendRecommendationEmail(user.email, weakTopic);
    }

    res.status(200).json({
      message: "AI recommendations generated successfully",
      recommendation
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
