"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function QuizPage() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const startQuiz = async () => {
    if (!domain) return alert("Please enter a domain");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/quiz/generate`,
        { domain },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuizData(res.data.quiz);
      setIsStarted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to start quiz.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/quiz/evaluate`,
        {
          quizId: quizData._id,
          questionIndex: currentQuestionIndex,
          user_answer: answer,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to evaluate answer.");
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer("");
      setFeedback(null);
    } else {
      router.push("/dashboard");
    }
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-10">
        <Link href="/dashboard" className="absolute top-10 left-10 text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
          <FaArrowLeft /> Back to Dashboard
        </Link>
        <h1 className="text-5xl font-bold mb-10 text-cyan-400">Adaptive AI Quiz 🚀</h1>
        <div className="bg-white/10 p-8 rounded-3xl border border-white/10 w-full max-w-md text-center">
          <h2 className="text-2xl mb-6">Choose a Domain</h2>
          <input 
            type="text" 
            placeholder="e.g., Docker, Next.js, System Design" 
            className="w-full p-4 rounded-xl bg-[#1e293b] border border-white/10 text-white outline-none mb-6"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <button 
            onClick={startQuiz}
            disabled={loading}
            className="w-full bg-cyan-400 text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? "Generating Quiz with AI..." : "Start AI Quiz"}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-10 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-cyan-400">Question {currentQuestionIndex + 1} of {quizData.questions.length}</h1>
          <span className="text-xl text-gray-400">Domain: <span className="text-white capitalize">{quizData.domain}</span></span>
        </div>

        <div className="bg-white/10 p-8 rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="text-2xl mb-6 font-medium">{currentQuestion?.question}</h2>

          {!feedback ? (
            <>
              <textarea
                placeholder="Type your answer here. Be as detailed as possible..."
                rows="8"
                className="w-full p-5 rounded-2xl bg-[#1e293b] border border-white/10 outline-none focus:border-cyan-400 transition"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <button 
                onClick={submitAnswer}
                disabled={evaluating}
                className="mt-6 w-full bg-cyan-400 text-black px-8 py-4 rounded-2xl font-bold hover:bg-cyan-300 transition disabled:opacity-50"
              >
                {evaluating ? "AI is evaluating your answer..." : "Submit Answer"}
              </button>
            </>
          ) : (
            <div className="mt-6 animate-fade-in">
              <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl font-bold p-4 bg-cyan-400/20 text-cyan-400 rounded-full">
                    {feedback.score}/10
                  </div>
                  <h3 className="text-xl font-bold">AI Feedback</h3>
                </div>
                <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">{feedback.feedback}</p>
              </div>
              <button 
                onClick={nextQuestion}
                className="mt-6 w-full bg-green-400 text-black px-8 py-4 rounded-2xl font-bold hover:bg-green-300 transition"
              >
                {currentQuestionIndex < quizData.questions.length - 1 ? "Next Question" : "Finish Quiz"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}