const express = require("express");

const router = express.Router();

const User = require("../models/User");

const Recommendation =
require("../models/Recommendation");

const {
  sendRecommendationEmail
} = require("../services/emailService");
const { protect } = require("../middleware/authMiddleware");

router.post("/generate", protect, async (req, res) => {

  try {

    const userId = req.user ? req.user._id : req.body.userId;
    const user = await User.findById(userId);

    const weakTopic =
      user.weak_topics?.[0] ||
      "System Design";

    const { generateRecommendations } = require("../services/aiService");
    const recommendations = await generateRecommendations(weakTopic);

    const recommendation =
      await Recommendation.create({
        user: userId,
        weak_topic: weakTopic,
        recommendations
      });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await sendRecommendationEmail(user.email, weakTopic);
    }

    res.status(200).json({

      message:
        "AI recommendations generated successfully",

      recommendation

    });

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

});

module.exports = router;