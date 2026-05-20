const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    domains: {
      type: [String],
      default: []
    },

    level: {
      type: String,
      default: "Beginner"
    },
    average_score: {
  type: Number,
  default: 0
},

difficulty_level: {
  type: String,
  enum: ["Beginner", "Intermediate", "Advanced"],
  default: "Beginner"
},

weak_topics: {
  type: [String],
  default: []
},

    goals: {
      type: [String],
      default: []
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata"
    }
  },
  {
    timestamps: true
  },
  
  
);

module.exports = mongoose.model("User", userSchema);
