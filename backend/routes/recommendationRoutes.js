const express = require("express");

const router = express.Router();

const User = require("../models/User");

const Recommendation =
require("../models/Recommendation");

const {
  sendRecommendationEmail
} = require("../services/emailService");

router.post("/generate", async (req, res) => {

  try {

    const { userId } = req.body;

    const user = await User.findById(userId);

    const weakTopic =
      user.weak_topics?.[0] ||
      "Docker Networking";

    let recommendations = [];

    recommendations = [
      "Revise bridge networking",
      "Practice container communication",
      "Learn Docker Compose networking"
    ];

    const recommendation =
      await Recommendation.create({

        user: userId,

        weak_topic: weakTopic,

        recommendations

      });

    await sendRecommendationEmail(
      user.email,
      weakTopic
    );

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