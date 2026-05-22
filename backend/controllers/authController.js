const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      domains,
      level,
      goals,
      timezone
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isAdmin =
      process.env.ADMIN_EMAIL &&
      email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      domains,
      level,
      goals,
      timezone,
      role: isAdmin ? "admin" : "user"
    });

    res.status(201).json({
  message: "Signup successful",
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    domains: user.domains,
    level: user.level,
    goals: user.goals,
    timezone: user.timezone,
    role: user.role,
    preferred_language: user.preferred_language
  }
});

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

   res.status(200).json({
  message: "Login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    domains: user.domains,
    level: user.level,
    goals: user.goals,
    timezone: user.timezone,
    role: user.role,
    preferred_language: user.preferred_language
  }
});

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  signup,
  login
};