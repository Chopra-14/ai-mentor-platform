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

module.exports = {
  generateQuizQuestions,
  evaluateUserAnswer,
  generateRecommendations
};
