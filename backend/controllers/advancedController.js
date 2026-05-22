const User = require("../models/User");
const {
  generateStudyPlan,
  analyzeResume,
  generateCodingChallenges
} = require("../services/aiService");

const createStudyPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { weeks = 4 } = req.body;

    const plan = await generateStudyPlan(
      user.domains,
      user.level,
      user.weak_topics,
      user.goals,
      weeks,
      user.preferred_language
    );

    res.status(200).json({
      message: "Study plan generated",
      plan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeUserResume = async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        message: "Please provide resume text (at least 50 characters)"
      });
    }

    const user = await User.findById(req.user._id);
    const analysis = await analyzeResume(
      resumeText,
      targetRole || user.domains?.[0] || "Software Engineer",
      user.preferred_language
    );

    res.status(200).json({
      message: "Resume analyzed",
      analysis
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCodingChallenges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { language = "JavaScript", difficulty } = req.body;
    const level = difficulty || user.difficulty_level;

    const challenges = await generateCodingChallenges(
      language,
      level,
      user.domains,
      user.preferred_language
    );

    res.status(200).json({
      message: "Coding challenges generated",
      challenges
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStudyPlan,
  analyzeUserResume,
  createCodingChallenges
};
