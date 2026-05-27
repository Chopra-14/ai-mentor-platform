const axios = require("axios");
const User = require("../models/User");
const Quiz = require("../models/Quiz");

// ─────────────────────────────────────────────
// FALLBACK QUESTIONS per domain
// Used when Gemini API quota is exceeded
// ─────────────────────────────────────────────
const FALLBACK_QUESTIONS = {
  "react": [
    { question: "Explain the difference between controlled and uncontrolled components in React. When would you use each?" },
    { question: "How does React's reconciliation algorithm work? What is the Virtual DOM and why is it useful?" },
    { question: "Explain the useEffect hook. How do you handle cleanup and what are common mistakes developers make with it?" },
    { question: "What is the Context API? How does it compare to Redux for state management?" },
    { question: "How would you optimize a slow React application? Describe at least 3 performance techniques." }
  ],
  "node.js": [
    { question: "Explain the Node.js event loop. How does it handle asynchronous operations?" },
    { question: "What is the difference between process.nextTick(), setImmediate(), and setTimeout() in Node.js?" },
    { question: "How do you handle errors in Express.js middleware? Show the pattern for global error handling." },
    { question: "What are streams in Node.js? When would you use them over reading a full file into memory?" },
    { question: "How would you build a rate limiter in Node.js without using an external library?" }
  ],
  "python": [
    { question: "Explain Python's GIL (Global Interpreter Lock). How does it affect multithreading?" },
    { question: "What are Python decorators? Write a decorator that measures function execution time." },
    { question: "Explain the difference between generators and regular functions. When would you use yield?" },
    { question: "How does Python's memory management work? Explain reference counting and garbage collection." },
    { question: "What are context managers? How do you create a custom one using both class-based and @contextmanager approaches?" }
  ],
  "devops": [
    { question: "Explain the difference between Docker containers and virtual machines. When would you choose one over the other?" },
    { question: "Describe a CI/CD pipeline you would set up for a Node.js application. What stages would it include?" },
    { question: "What is Kubernetes and what problems does it solve? Explain pods, services, and deployments." },
    { question: "How would you monitor a production application? What metrics and tools would you use?" },
    { question: "Explain blue-green deployment and canary deployment. What are the trade-offs of each?" }
  ],
  "system design": [
    { question: "Design a URL shortener like bit.ly. Walk through the architecture, database schema, and scaling strategy." },
    { question: "How would you design a notification system that handles 10 million users? Discuss queues and fan-out strategies." },
    { question: "Explain CAP theorem. How does it apply when choosing between MongoDB and PostgreSQL?" },
    { question: "Design a rate limiter for an API. What algorithms would you use and how would you handle distributed systems?" },
    { question: "How would you design a real-time chat application? Discuss WebSockets, message storage, and scaling." }
  ],
  "docker": [
    { question: "What is the difference between a Docker image and a container? Explain layers in Docker images." },
    { question: "Write a Dockerfile for a Node.js application. What best practices would you follow?" },
    { question: "Explain Docker Compose. How does it differ from Docker Swarm and Kubernetes?" },
    { question: "How do Docker volumes work? What is the difference between bind mounts and named volumes?" },
    { question: "How would you reduce a Docker image size? Describe at least 4 optimization techniques." }
  ],
  "mongodb": [
    { question: "Explain the difference between embedding and referencing documents in MongoDB. When would you use each?" },
    { question: "What are MongoDB indexes? How do compound indexes work and how do you optimize query performance?" },
    { question: "Explain MongoDB's aggregation pipeline. Write an example to group sales by month and calculate totals." },
    { question: "How does MongoDB handle transactions? What are the limitations compared to SQL databases?" },
    { question: "What is sharding in MongoDB? How does it work and when would you implement it?" }
  ],
  "javascript": [
    { question: "Explain closures in JavaScript with a real-world example. How are they used in practice?" },
    { question: "What is the prototype chain? How does prototypal inheritance differ from classical inheritance?" },
    { question: "Explain Promise chaining vs async/await. What are the advantages and common pitfalls of each?" },
    { question: "What is event delegation? How does it improve performance and how do you implement it?" },
    { question: "Explain the difference between == and ===, and describe JavaScript's type coercion rules." }
  ]
};

const getFallbackQuestions = (domain) => {
  const key = domain.toLowerCase();
  // Direct match
  if (FALLBACK_QUESTIONS[key]) return FALLBACK_QUESTIONS[key];
  // Partial match (e.g. "Node" matches "node.js")
  const partialKey = Object.keys(FALLBACK_QUESTIONS).find(k => k.includes(key) || key.includes(k));
  if (partialKey) return FALLBACK_QUESTIONS[partialKey];
  // Generic fallback
  return [
    { question: `What are the core fundamentals of ${domain} that every developer should know?` },
    { question: `Describe a challenging ${domain} problem you've solved. What was your approach?` },
    { question: `What are the most common performance bottlenecks in ${domain} and how do you address them?` },
    { question: `How do you ensure code quality and maintainability in ${domain} projects?` },
    { question: `What are the latest trends and best practices in ${domain} for production applications?` }
  ];
};

// ─────────────────────────────────────────────
// HELPER — call Gemini REST API with fallback
// ─────────────────────────────────────────────
const askAI = async (prompt, domain = null) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
    });

    const text = response.data.candidates[0].content.parts[0].text.trim();
    const clean = text.replace(/```json|```/g, "").trim();
    return { data: JSON.parse(clean), fromFallback: false };

  } catch (error) {
    // 429 = quota exceeded → use fallback
    if (error.response?.status === 429 && domain) {
      console.warn("Gemini quota exceeded — using fallback questions for:", domain);
      return { data: null, fromFallback: true };
    }
    throw error;
  }
};

// ─────────────────────────────────────────────
// 1. GENERATE QUIZ
// ─────────────────────────────────────────────
const generateQuiz = async (req, res) => {
  try {
    const userId = req.user._id;
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ message: "Domain is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const avgScore = user.average_score ?? 0;
    const difficulty =
      avgScore >= 80 ? "Advanced" :
      avgScore >= 50 ? "Intermediate" : "Beginner";

    const prompt = `
You are a technical interviewer. Generate 5 real interview questions for domain: "${domain}".
Difficulty: ${difficulty}.
Rules:
- Practical, technical questions like real interviews
- Mix conceptual, scenario-based, and problem-solving
- No multiple choice questions
- Each needs a detailed written answer

Respond ONLY with valid JSON, no markdown:
{
  "questions": [
    { "question": "..." },
    { "question": "..." },
    { "question": "..." },
    { "question": "..." },
    { "question": "..." }
  ]
}`;

    const { data: aiData, fromFallback } = await askAI(prompt, domain);

    const questions = fromFallback
      ? getFallbackQuestions(domain)
      : aiData.questions;

    const quiz = await Quiz.create({
      user: userId,
      domain,
      difficulty,
      questions
    });

    res.status(200).json({
      message: "Quiz generated successfully",
      quiz,
      source: fromFallback ? "fallback" : "ai"
    });

  } catch (error) {
    console.error("generateQuiz error:", error.message);
    res.status(500).json({ message: "Failed to generate quiz. " + error.message });
  }
};

// ─────────────────────────────────────────────
// 2. EVALUATE ANSWERS
// ─────────────────────────────────────────────
const evaluateAnswer = async (req, res) => {
  try {
    const { domain, difficulty, questions, answers } = req.body;

    if (!questions || !answers || questions.length === 0) {
      return res.status(400).json({ message: "Questions and answers are required." });
    }

    const qaPairs = questions.map((q, i) => (
      `Q${i + 1}: ${q.question}\nAnswer: ${answers[i] || "(no answer provided)"}`
    )).join("\n\n");

    const prompt = `
You are a strict but fair technical interviewer evaluating answers for a ${difficulty || "Beginner"} level ${domain} interview.

Evaluate each answer. Respond ONLY with valid JSON, no markdown:

${qaPairs}

Return:
{
  "score": <total out of ${questions.length * 10}>,
  "scorePercent": <0-100>,
  "performance": "<Beginner|Intermediate|Advanced|Expert>",
  "weakAreas": ["<topic1>", "<topic2>"],
  "recommendation": "<2-3 sentence personalized advice>",
  "feedback": [
    { "score": <0-10>, "comment": "<specific feedback>" }
  ]
}

Scoring: 9-10=Excellent, 7-8=Good, 5-6=Average, 3-4=Weak, 1-2=Poor, 0=No answer`;

    const { data: evalData, fromFallback } = await askAI(prompt, domain);

    // Fallback evaluation — score by answer length/quality heuristic
    if (fromFallback) {
      const feedback = answers.map((ans) => {
        const len = (ans || "").trim().length;
        const score = len > 200 ? 7 : len > 100 ? 5 : len > 30 ? 3 : len > 0 ? 1 : 0;
        const comment =
          len > 200 ? "Good detailed answer." :
          len > 100 ? "Decent answer, add more detail." :
          len > 30  ? "Too brief, expand your explanation." :
          len > 0   ? "Very short. Please elaborate." : "No answer provided.";
        return { score, comment };
      });

      const totalScore = feedback.reduce((a, f) => a + f.score, 0);
      const scorePercent = Math.round((totalScore / (questions.length * 10)) * 100);
      const performance =
        scorePercent >= 80 ? "Advanced" :
        scorePercent >= 60 ? "Intermediate" :
        scorePercent >= 40 ? "Beginner" : "Needs Improvement";

      return res.status(200).json({
        score: totalScore,
        scorePercent,
        performance,
        weakAreas: [`${domain} concepts`],
        recommendation: `Keep practicing ${domain}. Review your weak areas and attempt more quizzes.`,
        feedback
      });
    }

    if (req.body.quizId) {
      await Quiz.findByIdAndUpdate(req.body.quizId, {
        totalScore: Math.round((evalData.scorePercent ?? 0) / 10),
        evaluation: evalData
      });
    }

    res.status(200).json(evalData);

  } catch (error) {
    console.error("evaluateAnswer error:", error.message);
    res.status(500).json({ message: "Failed to evaluate answers. " + error.message });
  }
};

// ─────────────────────────────────────────────
// 3. UPDATE PERFORMANCE
// ─────────────────────────────────────────────
const updatePerformance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { average_score, weak_topics } = req.body;

    if (average_score === undefined) {
      return res.status(400).json({ message: "average_score is required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newLevel =
      average_score >= 80 ? "Advanced" :
      average_score >= 50 ? "Intermediate" : "Beginner";

    const existingWeak = user.weak_topics ?? [];
    const mergedWeak = [...new Set([...(weak_topics ?? []), ...existingWeak])].slice(0, 5);

    await User.findByIdAndUpdate(userId, {
      average_score,
      difficulty_level: newLevel,
      weak_topics: mergedWeak
    });

    res.status(200).json({
      message: "Performance updated successfully",
      difficulty_level: newLevel,
      weak_topics: mergedWeak
    });

  } catch (error) {
    console.error("updatePerformance error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// 4. GET QUIZZES
// ─────────────────────────────────────────────
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateQuiz, evaluateAnswer, updatePerformance, getQuizzes };