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
  bot.sendMessage(chatId, "Welcome to the AI Mentor Platform! 🚀\n\nSend /quiz to start an adaptive learning quiz.\nSend /stats to view your performance.\nSend /recommend to get study recommendations.");
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