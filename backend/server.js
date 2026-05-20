const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const recommendationRoutes =
require("./routes/recommendationRoutes");


connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use(
  "/api/recommendation",
  recommendationRoutes
);


app.get("/", (req, res) => {
  res.send("AI Learning Assistant Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});