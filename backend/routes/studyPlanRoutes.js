const express = require("express");
const router = express.Router();
const axios = require("axios");
const { protect } = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────
// FALLBACK STUDY PLANS per domain
// Used when Gemini API quota is exceeded
// ─────────────────────────────────────────────
const FALLBACK_PLANS = {
  react: [
    { focus: "React Fundamentals", tasks: ["Learn JSX syntax", "Understand functional components", "Practice props and state"], resources: ["React Official Docs", "FreeCodeCamp React Course"] },
    { focus: "Hooks Deep Dive", tasks: ["Master useState and useEffect", "Learn useContext and useRef", "Build a custom hook"], resources: ["React Hooks Docs", "ui.dev/react-hooks"] },
    { focus: "State Management", tasks: ["Learn Context API", "Intro to Redux Toolkit", "Compare Zustand vs Redux"], resources: ["Redux Toolkit Docs", "Zustand GitHub"] },
    { focus: "API Integration", tasks: ["Fetch data with useEffect", "Use Axios in React", "Handle loading and error states"], resources: ["Axios Docs", "TanStack Query Docs"] },
    { focus: "Performance & Testing", tasks: ["React.memo and useMemo", "Code splitting with lazy", "Write tests with React Testing Library"], resources: ["React Testing Library Docs", "Web.dev Performance"] },
  ],
  "node.js": [
    { focus: "Node.js Core", tasks: ["Understand event loop", "Work with fs and path modules", "Build a basic HTTP server"], resources: ["Node.js Docs", "NodeSchool.io"] },
    { focus: "Express.js", tasks: ["Set up Express app", "Build REST API endpoints", "Use middleware for validation"], resources: ["Express Docs", "FreeCodeCamp Node Course"] },
    { focus: "Database Integration", tasks: ["Connect MongoDB with Mongoose", "Create models and schemas", "Implement CRUD operations"], resources: ["Mongoose Docs", "MongoDB University"] },
    { focus: "Authentication", tasks: ["Implement JWT auth", "Hash passwords with bcrypt", "Build login/signup endpoints"], resources: ["JWT.io", "bcrypt npm docs"] },
    { focus: "Deployment & Testing", tasks: ["Write tests with Jest", "Deploy on Render", "Set up environment variables"], resources: ["Jest Docs", "Render Docs"] },
  ],
  python: [
    { focus: "Python Basics", tasks: ["Variables, loops, functions", "Lists, dicts, tuples", "File I/O operations"], resources: ["Python Docs", "W3Schools Python"] },
    { focus: "OOP in Python", tasks: ["Classes and objects", "Inheritance and polymorphism", "Magic methods"], resources: ["Real Python OOP", "Python Docs OOP"] },
    { focus: "Python Libraries", tasks: ["NumPy arrays", "Pandas DataFrames", "Matplotlib basics"], resources: ["Kaggle Courses", "Pandas Docs"] },
    { focus: "Web with Flask", tasks: ["Set up Flask app", "Build REST APIs", "Connect to database"], resources: ["Flask Docs", "Miguel Grinberg Blog"] },
    { focus: "Advanced Python", tasks: ["Decorators and generators", "Async with asyncio", "Unit testing with pytest"], resources: ["Real Python Advanced", "pytest Docs"] },
  ],
  devops: [
    { focus: "Linux & Shell", tasks: ["Basic Linux commands", "Write shell scripts", "File permissions and users"], resources: ["Linux Journey", "TutorialsPoint Linux"] },
    { focus: "Docker", tasks: ["Install and run containers", "Write Dockerfiles", "Use Docker Compose"], resources: ["Docker Docs", "KodeKloud Docker"] },
    { focus: "CI/CD Pipelines", tasks: ["Set up GitHub Actions", "Automate tests on push", "Deploy on merge"], resources: ["GitHub Actions Docs", "Jenkins Beginner Guide"] },
    { focus: "Kubernetes", tasks: ["Pods and deployments", "Services and ingress", "ConfigMaps and secrets"], resources: ["Kubernetes Docs", "KodeKloud K8s"] },
    { focus: "Monitoring & Cloud", tasks: ["Set up Prometheus + Grafana", "AWS EC2 basics", "Cloud deployment strategies"], resources: ["AWS Free Tier", "Grafana Docs"] },
  ],
  "system design": [
    { focus: "Fundamentals", tasks: ["Scalability concepts", "CAP theorem", "Latency vs throughput"], resources: ["System Design Primer GitHub", "ByteByteGo"] },
    { focus: "Databases", tasks: ["SQL vs NoSQL", "Indexing strategies", "Replication and sharding"], resources: ["MongoDB Docs", "Use The Index Luke"] },
    { focus: "Caching & CDN", tasks: ["Redis basics", "Cache invalidation strategies", "CDN concepts"], resources: ["Redis Docs", "AWS CloudFront Docs"] },
    { focus: "Microservices", tasks: ["API Gateway pattern", "Service communication", "Message queues with RabbitMQ"], resources: ["Microservices.io", "RabbitMQ Tutorials"] },
    { focus: "Design Practice", tasks: ["Design URL shortener", "Design chat system", "Design rate limiter"], resources: ["Grokking System Design", "ByteByteGo YouTube"] },
  ],
  docker: [
    { focus: "Docker Basics", tasks: ["Install Docker", "Run your first container", "Understand images vs containers"], resources: ["Docker Docs", "Play With Docker"] },
    { focus: "Dockerfiles", tasks: ["Write multi-stage Dockerfiles", "Optimize image size", "Use .dockerignore"], resources: ["Dockerfile Best Practices", "Docker Hub"] },
    { focus: "Docker Compose", tasks: ["Write docker-compose.yml", "Multi-container apps", "Networking between services"], resources: ["Docker Compose Docs", "Awesome Compose GitHub"] },
    { focus: "Volumes & Networking", tasks: ["Named volumes vs bind mounts", "Custom networks", "Container communication"], resources: ["Docker Networking Docs", "KodeKloud Docker"] },
    { focus: "Docker in CI/CD", tasks: ["Build images in GitHub Actions", "Push to Docker Hub", "Deploy containerized apps"], resources: ["GitHub Actions + Docker", "Docker Scout"] },
  ],
  mongodb: [
    { focus: "MongoDB Basics", tasks: ["Install and connect", "CRUD operations", "MongoDB Compass"], resources: ["MongoDB Docs", "MongoDB University M001"] },
    { focus: "Schema Design", tasks: ["Embedding vs referencing", "One-to-many patterns", "Schema validation"], resources: ["MongoDB Data Modeling", "MongoDB University M320"] },
    { focus: "Indexes & Performance", tasks: ["Create indexes", "Compound indexes", "Explain query plans"], resources: ["MongoDB Indexing Docs", "Studio 3T Tips"] },
    { focus: "Aggregation Pipeline", tasks: ["$match, $group, $project", "$lookup for joins", "Build analytics queries"], resources: ["Aggregation Docs", "MongoDB University M121"] },
    { focus: "Production", tasks: ["Replication sets", "Atlas cloud setup", "Backup strategies"], resources: ["MongoDB Atlas Docs", "MongoDB University M103"] },
  ],
  javascript: [
    { focus: "JS Fundamentals", tasks: ["var vs let vs const", "Functions and scope", "Arrays and objects"], resources: ["MDN JavaScript Guide", "javascript.info"] },
    { focus: "Advanced JS", tasks: ["Closures and hoisting", "Prototypes and classes", "Event loop and async"], resources: ["You Don't Know JS", "javascript.info Advanced"] },
    { focus: "Async JavaScript", tasks: ["Promises and chaining", "async/await patterns", "Error handling"], resources: ["MDN Promises", "javascript.info Async"] },
    { focus: "DOM & Browser", tasks: ["DOM manipulation", "Event delegation", "Fetch API"], resources: ["MDN DOM Docs", "javascript30.com"] },
    { focus: "Modern JS & Tools", tasks: ["ES6+ features", "Modules and bundlers", "Unit testing with Jest"], resources: ["ES6 Features", "Vite Docs", "Jest Docs"] },
  ],
};

// Smart generic phases for any unknown domain
const GENERIC_PHASES = [
  { focus: "Foundations & Setup",      tasks: (d) => [`Install and set up ${d} environment`, `Understand core ${d} concepts and terminology`, `Complete an official ${d} beginner tutorial`],         resources: (d) => [`${d} Official Documentation`, "YouTube Beginner Guide"] },
  { focus: "Core Concepts",            tasks: (d) => [`Learn fundamental ${d} building blocks`, `Practice with small hands-on exercises`, `Read a beginner ${d} article or blog post`],               resources: (d) => [`${d} Tutorial Series`, "freeCodeCamp.org"] },
  { focus: "Intermediate Skills",      tasks: (d) => [`Explore intermediate ${d} features`, `Build a small working ${d} project`, `Debug and fix common ${d} errors`],                                resources: (d) => [`${d} Intermediate Guide`, "Stack Overflow"] },
  { focus: "Real-World Application",   tasks: (d) => [`Apply ${d} to a real-world scenario`, `Integrate ${d} with other tools or APIs`, `Review ${d} best practices and design patterns`],           resources: (d) => [`${d} Best Practices`, "GitHub Examples"] },
  { focus: "Advanced Topics",          tasks: (d) => [`Study advanced ${d} patterns`, `Optimize performance in ${d}`, `Explore ${d} edge cases and error handling`],                                  resources: (d) => [`Advanced ${d} Course`, "Medium / Dev.to Articles"] },
  { focus: "Testing & Code Quality",   tasks: (d) => [`Write unit tests for your ${d} code`, `Learn ${d} debugging techniques`, `Refactor ${d} code for readability`],                               resources: (d) => [`${d} Testing Guide`, "Clean Code Book"] },
  { focus: "Project & Portfolio",      tasks: (d) => [`Build a complete ${d} portfolio project`, `Document your ${d} project with a README`, `Deploy or showcase your ${d} project`],                 resources: (d) => [`${d} Project Ideas`, "GitHub Pages / Vercel"] },
  { focus: "Interview Preparation",    tasks: (d) => [`Study top ${d} interview questions`, `Practice explaining ${d} concepts`, `Do ${d} mock interviews and timed challenges`],                     resources: (d) => [`${d} Interview Questions`, "LeetCode / HackerRank"] },
];

const getFallbackPlan = (domain, weeks) => {
  const key = domain.toLowerCase();

  // Exact match
  let base = FALLBACK_PLANS[key];

  // Partial match (e.g. "data engineer" partially matches nothing, falls through)
  if (!base) {
    const matchKey = Object.keys(FALLBACK_PLANS).find(
      (k) => k.includes(key) || key.includes(k)
    );
    if (matchKey) base = FALLBACK_PLANS[matchKey];
  }

  const plan = [];
  for (let i = 0; i < weeks; i++) {
    if (base && i < base.length) {
      plan.push({ week: i + 1, domain, ...base[i] });
    } else {
      // Smart generic phase — cycles through 8 meaningful phases
      const phase = GENERIC_PHASES[i % GENERIC_PHASES.length];
      const cycleNum = Math.floor(i / GENERIC_PHASES.length) + 1;
      plan.push({
        week: i + 1,
        domain,
        focus: cycleNum > 1 ? `${phase.focus} – Level ${cycleNum}` : phase.focus,
        tasks: phase.tasks(domain),
        resources: phase.resources(domain)
      });
    }
  }
  return plan;
};

// ─────────────────────────────────────────────
// HELPER — Gemini REST call
// ─────────────────────────────────────────────
const askGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 3000 }
  });

  const text = response.data.candidates[0].content.parts[0].text.trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

// ─────────────────────────────────────────────
// POST /api/studyplan/generate
// ─────────────────────────────────────────────
router.post("/generate", protect, async (req, res) => {
  try {
    const { weeks, domain } = req.body;

    if (!domain || !weeks) {
      return res.status(400).json({ message: "Domain and weeks are required." });
    }

    if (isNaN(weeks) || weeks < 1 || weeks > 52) {
      return res.status(400).json({ message: "Weeks must be between 1 and 52." });
    }

    const numWeeks = parseInt(weeks);

    // Try Gemini first
    try {
      const prompt = `
Create a ${numWeeks}-week study plan for learning "${domain}" from beginner to advanced level.

For each week provide a focused learning goal, 3 specific actionable tasks, and 2 learning resources.

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "plan": [
    {
      "week": 1,
      "domain": "${domain}",
      "focus": "Topic focus for this week",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "resources": ["Resource 1", "Resource 2"]
    }
  ]
}

Generate exactly ${numWeeks} week objects.`;

      const aiData = await askGemini(prompt);

      return res.json({
        message: "Study plan generated successfully",
        plan: aiData.plan,
        source: "ai"
      });

    } catch (geminiErr) {
      // 429 quota or any Gemini error → use fallback
      if (geminiErr.response?.status === 429 || geminiErr.response?.status === 404) {
        console.warn("Gemini quota hit — using fallback study plan for:", domain);
        const plan = getFallbackPlan(domain, numWeeks);
        return res.json({
          message: "Study plan generated successfully",
          plan,
          source: "fallback"
        });
      }
      throw geminiErr;
    }

  } catch (error) {
    console.error("studyPlan error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;