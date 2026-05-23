const mongoose = require("mongoose");

const progressSchema =
new mongoose.Schema({

  userId: String,

  completedQuizzes: Number,

  averageScore: Number,

  generatedPlans: Number,

  streak: Number

});

module.exports =
mongoose.model(
  "Progress",
  progressSchema
);