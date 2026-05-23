const dotenv = require("dotenv");

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing in backend/.env");
  process.exit(1);
}

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const advancedRoutes = require("./routes/advancedRoutes");
const profileRoutes = require("./routes/profileRoutes");
const studyPlanRoutes =
require("./routes/studyPlanRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);

app.use("/api/recommendation", recommendationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/advanced", advancedRoutes);
app.use("/api/profile", profileRoutes);
app.use(
  "/api/studyplan",
  studyPlanRoutes
);

app.get("/", (req, res) => {
  res.send("AI Learning Assistant Backend Running");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mongo: require("mongoose").connection.readyState === 1
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});