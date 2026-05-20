const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  weak_topic: String,

  recommendations: [
    String
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model(
  "Recommendation",
  recommendationSchema
);