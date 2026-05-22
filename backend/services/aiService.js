const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL_NAME = process.env.MODEL_NAME || "llama3"; // user needs to pull this model locally in ollama

const generateAIResponse = async (prompt) => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    console.error("AI Service Error:", error);
    // Fallback response if Ollama is not running or fails
    return `[AI Unavailable] Error: ${error.message}`;
  }
};

const generateQuizQuestions = async (domain, difficulty) => {
  const prompt = `You are an expert technical interviewer. Generate exactly 3 interview questions about ${domain} at a ${difficulty} difficulty level. 
  Output ONLY a valid JSON array of strings, where each string is a question. Example: ["Question 1", "Question 2", "Question 3"]. Do not include markdown formatting like \`\`\`json.`;
  
  const text = await generateAIResponse(prompt);
  
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", text);
  }
  
  // Fallback
  return [
    `Explain the core concepts of ${domain}.`,
    `What are the best practices for ${domain}?`,
    `Describe a complex problem you solved using ${domain}.`
  ];
};

const evaluateUserAnswer = async (question, answer) => {
  if (!answer || answer.trim() === "") {
    return { score: 0, feedback: "No answer provided." };
  }

  const prompt = `You are an expert technical evaluator. 
  Question: "${question}"
  User's Answer: "${answer}"
  
  Evaluate the answer. Give a score out of 10 and a short constructive feedback (strengths and improvements).
  Output ONLY valid JSON in this exact format, with no markdown formatting:
  {
    "score": <number between 0-10>,
    "feedback": "<string with feedback>"
  }`;

  const text = await generateAIResponse(prompt);
  
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed.score === 'number' && parsed.feedback) {
      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse AI evaluation as JSON:", text);
  }
  
  // Fallback
  return { score: 5, feedback: "AI evaluation unavailable. Please review manually." };
};

const generateRecommendations = async (weakTopic) => {
  const prompt = `The user is struggling with the topic: "${weakTopic}". 
  Provide exactly 3 actionable study recommendations or practice tasks to help them improve.
  Output ONLY a valid JSON array of strings. Example: ["Read documentation", "Build a small project", "Watch a tutorial"]. Do not include markdown formatting.`;

  const text = await generateAIResponse(prompt);
  
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse AI recommendations as JSON:", text);
  }
  
  // Fallback
  return [
    `Review official documentation for ${weakTopic}`,
    `Practice building a small project using ${weakTopic}`,
    `Find comprehensive video tutorials on ${weakTopic}`
  ];
};

const LANG_LABELS = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  es: "Spanish",
  fr: "French"
};

const languageInstruction = (code) => {
  const label = LANG_LABELS[code] || LANG_LABELS.en;
  return `Write all user-facing text in ${label}.`;
};

const parseJsonFromAI = (text) => {
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned);
};

const generateStudyPlan = async (
  domains,
  level,
  weakTopics,
  goals,
  weeks,
  lang = "en"
) => {
  const prompt = `You are an expert career coach. ${languageInstruction(lang)}
Create a ${weeks}-week personalized study plan for a ${level} learner.
Domains: ${(domains || []).join(", ") || "General Tech"}
Weak topics: ${(weakTopics || []).join(", ") || "None yet"}
Goals: ${(goals || []).join(", ") || "Interview preparation"}

Output ONLY valid JSON:
{
  "summary": "one paragraph overview",
  "weeks": [
    {
      "week": 1,
      "focus": "main theme",
      "tasks": ["task1", "task2", "task3"],
      "resources": ["resource1", "resource2"]
    }
  ]
}`;

  const text = await generateAIResponse(prompt);
  try {
    return parseJsonFromAI(text);
  } catch (e) {
    return {
      summary: `A ${weeks}-week plan focused on ${domains?.[0] || "core skills"}.`,
      weeks: Array.from({ length: weeks }, (_, i) => ({
        week: i + 1,
        focus: domains?.[0] || "Fundamentals",
        tasks: [
          "Review documentation",
          "Complete practice quiz",
          "Build a mini project"
        ],
        resources: ["Official docs", "LeetCode", "YouTube tutorials"]
      }))
    };
  }
};

const analyzeResume = async (resumeText, targetRole, lang = "en") => {
  const prompt = `You are an expert technical recruiter. ${languageInstruction(lang)}
Analyze this resume for a ${targetRole} role.

Resume:
${resumeText.slice(0, 6000)}

Output ONLY valid JSON:
{
  "overall_score": <0-100>,
  "strengths": ["..."],
  "improvements": ["..."],
  "missing_skills": ["..."],
  "action_items": ["..."]
}`;

  const text = await generateAIResponse(prompt);
  try {
    return parseJsonFromAI(text);
  } catch (e) {
    return {
      overall_score: 70,
      strengths: ["Clear structure", "Relevant experience listed"],
      improvements: ["Add measurable impact metrics", "Highlight project outcomes"],
      missing_skills: ["System design depth"],
      action_items: ["Tailor bullets to target role", "Add a projects section"]
    };
  }
};

const generateCodingChallenges = async (
  language,
  difficulty,
  domains,
  lang = "en"
) => {
  const prompt = `You are a coding interview expert. ${languageInstruction(lang)}
Generate exactly 3 coding challenges in ${language} at ${difficulty} difficulty.
Related domains: ${(domains || []).join(", ") || "General"}

Output ONLY valid JSON array:
[
  {
    "title": "Challenge name",
    "description": "problem statement",
    "difficulty": "${difficulty}",
    "hints": ["hint1", "hint2"],
    "sample_solution_outline": "high-level approach"
  }
]`;

  const text = await generateAIResponse(prompt);
  try {
    const parsed = parseJsonFromAI(text);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.error("Failed to parse coding challenges:", text);
  }

  return [
    {
      title: `${language} Array Challenge`,
      description: `Implement a ${difficulty}-level function to process collections efficiently.`,
      difficulty,
      hints: ["Consider edge cases", "Optimize time complexity"],
      sample_solution_outline: "Use iteration with O(n) complexity"
    },
    {
      title: `${language} String Parsing`,
      description: "Parse and validate structured input from user data.",
      difficulty,
      hints: ["Handle empty strings", "Use built-in methods"],
      sample_solution_outline: "Split, validate, and transform"
    },
    {
      title: `${language} Logic Problem`,
      description: "Solve a conditional logic problem relevant to interviews.",
      difficulty,
      hints: ["Break into subproblems", "Test with examples"],
      sample_solution_outline: "Decompose and unit test each branch"
    }
  ];
};

module.exports = {
  generateQuizQuestions,
  evaluateUserAnswer,
  generateRecommendations,
  generateStudyPlan,
  analyzeResume,
  generateCodingChallenges,
  languageInstruction
};
