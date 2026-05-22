![Node.js](https://img.shields.io/badge/Node.js-20-green)
![React](https://img.shields.io/badge/Next.js-14-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![Ollama](https://img.shields.io/badge/Ollama-llama3-orange)
![Telegram](https://img.shields.io/badge/Telegram-Bot-blue)

# 🦞 AI-Powered Adaptive Learning and Interview Preparation System using LLMs

A production-ready, full-stack AI mentor platform that generates personalized quizzes, evaluates answers dynamically, tracks progress using data analytics, and provides targeted study recommendations. It seamlessly integrates a Next.js web dashboard with a Node.js backend, MongoDB, and a Telegram Bot.

---

# 🚀 Features

- ✅ **Full-Stack Architecture**: Next.js frontend with TailwindCSS, Node.js + Express backend, MongoDB database.
- ✅ **Dynamic AI Quizzes**: Real-time generation of interview questions using local LLMs (Ollama) tailored to the user's specific domain and skill level.
- ✅ **AI Answer Evaluation**: Natural Language Processing applied to user answers to generate scores and constructive feedback instantly.
- ✅ **Adaptive Difficulty**: The system automatically scales question difficulty based on the user's past performance and overall accuracy.
- ✅ **Analytics Dashboard**: Rich interactive data visualizations using Recharts to track streaks, domain accuracy, and weak topics over time.
- ✅ **Multi-Platform Support**: Accessible via a beautiful, premium responsive Web Dashboard and directly through Telegram via an integrated bot.
- ✅ **JWT Authentication**: Secure user session management across the platform.

---

# 🏗️ System Architecture

```text
       [ Next.js Web Dashboard ]      [ Telegram User ]
                  ↓                           ↓
             [ Node.js + Express.js REST API Backend ]
                  ↓                           ↓
       [ MongoDB Database ]            [ Ollama Local LLM ]
       (Users, Quizzes, Stats)         (llama3 Inference)
```

---

# 📂 Project Structure

```text
openclaw-telegram-learning-assistant/
│
├── backend/                  # Node.js + Express API Server
│   ├── controllers/          # Business logic (auth, quiz, dashboard)
│   ├── middleware/           # JWT authentication guards
│   ├── models/               # Mongoose DB schemas
│   ├── routes/               # API endpoints
│   ├── services/             # AI integration (Ollama Axios client)
│   └── server.js             # Entry point
│
├── frontend/                 # Next.js Web App
│   ├── app/                  # App router pages (dashboard, quiz, analytics)
│   ├── public/               # Static assets
│   └── package.json
│
├── index.js                  # Telegram Bot Entry Point
├── Dockerfile                # Root docker configuration
├── docker-compose.yml        # Orchestration for Ollama and Backend
└── README.md
```

---

# ⚙️ Technologies Used

- **Frontend**: React, Next.js, Tailwind CSS, Recharts, Axios
- **Backend**: Node.js, Express.js, Mongoose, JWT, bcryptjs
- **Database**: MongoDB (Atlas)
- **AI Runtime**: Ollama (llama3)
- **Bot Integration**: node-telegram-bot-api
- **DevOps**: Docker, Docker Compose

---

# 🔧 Setup Instructions

## 1️⃣ Clone Repository

```bash
git clone <your_repository_url>
cd openclaw-telegram-learning-assistant
```

---

## 2️⃣ Install Ollama & Pull Model

Download and install Ollama: https://ollama.com

Start Ollama and pull the `llama3` model:

```bash
ollama serve
ollama pull llama3
```

---

## 3️⃣ Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:3000
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Root (`.env`):**
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
API_URL=http://localhost:5000
OLLAMA_URL=http://localhost:11434
```

---

## 4️⃣ Run the Application Locally

**Start Backend:**
```bash
cd backend
npm install
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Start Telegram Bot:**
```bash
cd ..
npm install
npm start
```

---

# ☁️ Cloud Deployment

- **Database**: Hosted on MongoDB Atlas.
- **Backend**: Deploy the `backend/` folder to Render or Railway. Set Environment Variables including `MONGO_URI`, `JWT_SECRET`, and `FRONTEND_URL`.
- **Frontend**: Deploy the `frontend/` folder to Vercel. Set `NEXT_PUBLIC_API_URL` to the Render backend URL.
- **Telegram Bot**: Run `index.js` on a VPS or Render Background Worker.

---

# 📸 Features Showcase

## Web Dashboard
Track your performance, accuracy, and streaks in a premium, glassmorphism-inspired UI.

## Analytics & Insights
Detailed breakdowns of your weakest topics and domain performance using Recharts.

## Adaptive AI Quizzes
Take quizzes directly on the web or via Telegram. Get instant AI-generated feedback and scores.

---

# 👩‍💻 Author

Konakalla Chopra Lakshmi Sathvika