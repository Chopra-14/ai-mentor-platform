const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    domain: {
      type: String,
      required: true
    },

    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner"
    },

    questions: [
  {
    question: String,

    user_answer: {
      type: String,
      default: ""
    },

    ai_feedback: {
      type: String,
      default: ""
    },

    score: {
      type: Number,
      default: 0
    }
  }
],

    average_score: {
      type: Number,
      default: 0
    },

    weak_topics: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);
const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    domain: String,

    questions: [
      {
        question: String,
        answer: String,
        userAnswer: String,
        score: Number
      }
    ],

    totalScore: Number
  },
  {
    timestamps: true
  }
);


module.exports = mongoose.model("Quiz", quizSchema);