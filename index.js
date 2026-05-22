require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = process.env.API_URL || "http://localhost:5000";

if (!token) {
  console.warn("TELEGRAM_BOT_TOKEN is not set. Bot will not start.");
  process.exit(0);
}

const bot = new TelegramBot(token, { polling: true });

// Simple memory store for user states and tokens
const userStates = {};
const userTokens = {};

async function ensureUserAuth(chatId) {
  if (userTokens[chatId]) return userTokens[chatId];
  
  // Auto-signup/login a bot user for this chat
  const email = `tguser_${chatId}@telegram.local`;
  const password = `tgpass_${chatId}`;
  
  try {
    let res;
    try {
      res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    } catch (err) {
      if (err.response && err.response.status === 400) {
        // Create user
        res = await axios.post(`${API_URL}/api/auth/signup`, {
          name: `Telegram User ${chatId}`,
          email,
          password,
          domains: ["General"],
          level: "Beginner"
        });
        // Login after create
        res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      } else {
        throw err;
      }
    }
    userTokens[chatId] = res.data.token;
    return res.data.token;
  } catch (err) {
    console.error("Auth error for Telegram bot:", err.message);
    return null;
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userStates[chatId] = { step: "idle" };
  bot.sendMessage(
    chatId,
    "Welcome to the AI Mentor Platform! 🚀\n\n" +
      "/quiz — adaptive interview quiz\n" +
      "/stats — performance dashboard\n" +
      "/recommend — AI study recommendations\n" +
      "/studyplan — personalized weekly plan\n" +
      "/resume — paste resume for AI review\n" +
      "/challenges — coding practice problems"
  );
});

bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Fetching your learning stats...");
  
  const token = await ensureUserAuth(chatId);
  if (!token) return bot.sendMessage(chatId, "Backend error. Please try again later.");

  try {
    const res = await axios.get(`${API_URL}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const stats = res.data;
    const msgText = `📊 **Your Performance**\n\nAccuracy: ${stats.overallAccuracy}%\nStreak: ${stats.streak} Days🔥\nWeakest Topic: ${stats.weakestTopic || "None"}\nQuizzes Taken: ${stats.recentQuizzes.length}`;
    bot.sendMessage(chatId, msgText, { parse_mode: "Markdown" });
  } catch (err) {
    bot.sendMessage(chatId, "Failed to load stats.");
  }
});

bot.onText(/\/recommend/, async (msg) => {
  const chatId = msg.chat.id;
  const token = await ensureUserAuth(chatId);
  if (!token) return bot.sendMessage(chatId, "Backend error.");
  bot.sendMessage(chatId, "Generating AI recommendations...");
  try {
    const res = await axios.post(
      `${API_URL}/api/recommendation/generate`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const recs = res.data.recommendation?.recommendations || [];
    bot.sendMessage(
      chatId,
      `📚 **Recommendations**\n\n${recs.map((r, i) => `${i + 1}. ${r}`).join("\n")}`,
      { parse_mode: "Markdown" }
    );
  } catch {
    bot.sendMessage(chatId, "Failed to generate recommendations.");
  }
});

bot.onText(/\/studyplan/, async (msg) => {
  const chatId = msg.chat.id;
  const token = await ensureUserAuth(chatId);
  if (!token) return bot.sendMessage(chatId, "Backend error.");
  bot.sendMessage(chatId, "Building your AI study plan...");
  try {
    const res = await axios.post(
      `${API_URL}/api/advanced/study-plan`,
      { weeks: 4 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const plan = res.data.plan;
    const weeks = (plan.weeks || [])
      .slice(0, 2)
      .map(
        (w) =>
          `*Week ${w.week}:* ${w.focus}\n${(w.tasks || []).slice(0, 2).map((t) => `• ${t}`).join("\n")}`
      )
      .join("\n\n");
    bot.sendMessage(
      chatId,
      `📚 **Study Plan**\n\n${plan.summary}\n\n${weeks}\n\n_(Full plan on web dashboard)_`,
      { parse_mode: "Markdown" }
    );
  } catch {
    bot.sendMessage(chatId, "Failed to generate study plan.");
  }
});

bot.onText(/\/challenges/, async (msg) => {
  const chatId = msg.chat.id;
  const token = await ensureUserAuth(chatId);
  if (!token) return bot.sendMessage(chatId, "Backend error.");
  try {
    const res = await axios.post(
      `${API_URL}/api/advanced/coding-challenges`,
      { language: "JavaScript" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const list = (res.data.challenges || [])
      .map((c, i) => `${i + 1}. *${c.title}* (${c.difficulty})\n${c.description}`)
      .join("\n\n");
    bot.sendMessage(chatId, `💻 **Coding Challenges**\n\n${list}`, {
      parse_mode: "Markdown"
    });
  } catch {
    bot.sendMessage(chatId, "Failed to generate challenges.");
  }
});

bot.onText(/\/resume/, (msg) => {
  const chatId = msg.chat.id;
  userStates[chatId] = { step: "waiting_resume" };
  bot.sendMessage(
    chatId,
    "Paste your resume text in the next message (min 50 characters). Optionally add target role on the first line: `Role: Backend Developer`"
  );
});

bot.onText(/\/quiz/, (msg) => {
  const chatId = msg.chat.id;
  userStates[chatId] = { step: "waiting_domain" };
  bot.sendMessage(chatId, "What domain would you like to practice? (e.g., Docker, System Design, React)");
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignore commands
  if (!text || text.startsWith("/")) return;

  const state = userStates[chatId] || { step: "idle" };

  if (state.step === "waiting_resume") {
    const token = await ensureUserAuth(chatId);
    if (!token) return bot.sendMessage(chatId, "Backend error.");
    let targetRole = "";
    let resumeText = text;
    if (text.toLowerCase().startsWith("role:")) {
      const lines = text.split("\n");
      targetRole = lines[0].replace(/^role:\s*/i, "").trim();
      resumeText = lines.slice(1).join("\n").trim();
    }
    bot.sendMessage(chatId, "Analyzing resume with AI...");
    try {
      const res = await axios.post(
        `${API_URL}/api/advanced/resume`,
        { resumeText, targetRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const a = res.data.analysis;
      bot.sendMessage(
        chatId,
        `📄 **Resume Score:** ${a.overall_score}/100\n\n**Strengths:** ${(a.strengths || []).slice(0, 2).join("; ")}\n\n**Improve:** ${(a.improvements || []).slice(0, 2).join("; ")}`,
        { parse_mode: "Markdown" }
      );
    } catch {
      bot.sendMessage(chatId, "Resume analysis failed. Ensure text is at least 50 characters.");
    }
    userStates[chatId].step = "idle";
    return;
  }

  if (state.step === "waiting_domain") {
    bot.sendMessage(chatId, `Generating an AI quiz for *${text}*... Please wait.`, { parse_mode: "Markdown" });
    const token = await ensureUserAuth(chatId);
    
    try {
      const res = await axios.post(`${API_URL}/api/quiz/generate`, { domain: text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const quiz = res.data.quiz;
      userStates[chatId] = {
        step: "answering",
        quizId: quiz._id,
        questions: quiz.questions,
        currentIndex: 0
      };
      
      bot.sendMessage(chatId, `Question 1:\n\n${quiz.questions[0].question}\n\n(Type your answer below)`);
    } catch (err) {
      bot.sendMessage(chatId, "Failed to generate quiz.");
      userStates[chatId].step = "idle";
    }
  } 
  else if (state.step === "answering") {
    const { quizId, questions, currentIndex } = state;
    bot.sendMessage(chatId, "Evaluating your answer with AI... 🤖");
    const token = await ensureUserAuth(chatId);
    
    try {
      const res = await axios.post(`${API_URL}/api/quiz/evaluate`, {
        quizId,
        questionIndex: currentIndex,
        user_answer: text
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { score, feedback } = res.data;
      bot.sendMessage(chatId, `**Score:** ${score}/10\n\n**Feedback:**\n${feedback}`, { parse_mode: "Markdown" });
      
      const nextIndex = currentIndex + 1;
      if (nextIndex < questions.length) {
        userStates[chatId].currentIndex = nextIndex;
        setTimeout(() => {
          bot.sendMessage(chatId, `Question ${nextIndex + 1}:\n\n${questions[nextIndex].question}\n\n(Type your answer below)`);
        }, 1000);
      } else {
        bot.sendMessage(chatId, "🎉 You have completed the quiz! Type /stats to see your updated performance.");
        userStates[chatId].step = "idle";
      }
    } catch (err) {
      bot.sendMessage(chatId, "Failed to evaluate answer.");
    }
  }
});

console.log("OpenClaw Telegram Learning Assistant Bot Started");