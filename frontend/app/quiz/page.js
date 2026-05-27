"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";
import api, { authHeaders, getErrorMessage } from "../../lib/api";

const DOMAINS = [
  "React", "Node.js", "Python", "DevOps",
  "System Design", "Docker", "MongoDB", "JavaScript"
];

export default function QuizPage() {
  const router = useRouter();

  const [domain, setDomain] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState("");
  const [answerError, setAnswerError] = useState("");

  // ✅ FIX — Auth check on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startQuiz = async () => {
    setFormError("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // ✅ FIX — Inline error instead of alert()
    if (!domain.trim()) {
      setFormError("Please select or enter a domain.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(
        "/api/quiz/generate",
        { domain },
        { headers: authHeaders() }
      );
      setQuiz(res.data.quiz);
    } catch (err) {
      // ✅ FIX — Handle 401 mid-session
      if (err.response?.status === 401) {
        router.push("/login");
        return;
      }
      setFormError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async () => {
    setAnswerError("");

    // ✅ FIX — Inline error instead of alert()
    if (!currentAnswer.trim()) {
      setAnswerError("Please write your answer before continuing.");
      return;
    }

    const updatedAnswers = [...answers, currentAnswer];
    setAnswers(updatedAnswers);
    setCurrentAnswer("");

    const isLast = currentQuestion + 1 >= quiz.questions.length;

    if (!isLast) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    // ✅ FIX — Submitting state prevents double-click
    setSubmitting(true);

    try {
      // ✅ FIX — Evaluate answers via AI (not hardcoded)
      const evalRes = await api.post(
        "/api/quiz/evaluate",
        {
          domain: quiz.domain,
          difficulty: quiz.difficulty,
          questions: quiz.questions,
          answers: updatedAnswers
        },
        { headers: authHeaders() }
      );

      const evalData = evalRes.data;
      setResult(evalData);

      // ✅ FIX — Save REAL performance data from AI evaluation
      await api.post(
        "/api/quiz/performance",
        {
          average_score: evalData.scorePercent ?? 0,
          weak_topics: evalData.weakAreas ?? []
        },
        { headers: authHeaders() }
      );

      // ✅ FIX — Only set completed AFTER successful API calls
      setCompleted(true);

    } catch (err) {
      if (err.response?.status === 401) {
        router.push("/login");
        return;
      }
      setAnswerError("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ FIX — Reset all state for "Take Another Quiz"
  const resetQuiz = () => {
    setQuiz(null);
    setCompleted(false);
    setResult(null);
    setAnswers([]);
    setCurrentQuestion(0);
    setCurrentAnswer("");
    setDomain("");
    setFormError("");
    setAnswerError("");
  };

  const progress = quiz
    ? Math.round((currentQuestion / quiz.questions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex flex-col md:flex-row">
      <AppSidebar />

      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <h1 className="text-5xl font-bold mb-2">Adaptive AI Interview 🚀</h1>
        <p className="text-gray-300 mb-8">
          Real-time AI interview experience based on your learning profile.
        </p>

        {/* ── DOMAIN SELECTION ── */}
        {!quiz && !completed && (
          <div className="bg-white/10 p-8 rounded-3xl border border-white/10 max-w-xl">
            <h2 className="text-2xl font-bold mb-2">Choose a Domain</h2>
            <p className="text-gray-400 mb-6 text-sm">Pick from suggestions or type your own.</p>

            {/* Quick-select chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {DOMAINS.map((d) => (
                <button
                  key={d}
                  onClick={() => { setDomain(d); setFormError(""); }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    domain === d
                      ? "bg-cyan-400 text-black border-cyan-400"
                      : "bg-white/10 text-gray-300 border-white/10 hover:border-cyan-400"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setFormError(""); }}
              placeholder="Or type a custom domain..."
              className="w-full p-4 rounded-xl bg-[#1e293b] border border-white/10 text-white outline-none mb-2 focus:border-cyan-400 transition-colors"
            />

            {formError && (
              <p className="text-red-400 text-sm mb-3">{formError}</p>
            )}

            <button
              onClick={startQuiz}
              disabled={loading}
              className="w-full bg-cyan-400 text-black py-4 rounded-xl font-bold mt-4 disabled:opacity-50 hover:bg-cyan-300 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generating Quiz...
                </span>
              ) : "Start AI Interview →"}
            </button>
          </div>
        )}

        {/* ── QUIZ SCREEN ── */}
        {quiz && !completed && (
          <div className="max-w-4xl">
            {/* Header */}
            <div className="bg-white/10 p-6 rounded-3xl mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-3xl font-bold text-cyan-400">{quiz.domain} Interview</h2>
                <span className="bg-white/10 px-4 py-2 rounded-full text-sm">
                  {currentQuestion + 1} / {quiz.questions.length}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Difficulty: <span className="text-cyan-400 font-semibold">{quiz.difficulty}</span>
              </p>
              {/* Progress bar */}
              <div className="w-full bg-[#1e293b] rounded-full h-2">
                <div
                  className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="bg-white/10 p-8 rounded-3xl border border-white/10">
              <h3 className="text-2xl font-bold mb-6 leading-relaxed">
                {quiz.questions[currentQuestion]?.question}
              </h3>

              <textarea
                value={currentAnswer}
                onChange={(e) => { setCurrentAnswer(e.target.value); setAnswerError(""); }}
                placeholder="Write your detailed answer here..."
                rows={8}
                className="w-full p-5 rounded-2xl bg-[#1e293b] border border-white/10 text-white outline-none mb-3 focus:border-cyan-400 transition-colors resize-none"
              />

              {answerError && (
                <p className="text-red-400 text-sm mb-4">{answerError}</p>
              )}

              <button
                onClick={nextQuestion}
                disabled={submitting}
                className="bg-cyan-400 text-black px-8 py-4 rounded-xl font-bold disabled:opacity-50 hover:bg-cyan-300 transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Evaluating...
                  </span>
                ) : currentQuestion + 1 === quiz.questions.length
                  ? "Submit Interview ✓"
                  : "Next Question →"}
              </button>
            </div>
          </div>
        )}

        {/* ── RESULTS SCREEN ── */}
        {completed && result && (
          <div className="max-w-4xl">
            <div className="bg-white/10 p-10 rounded-3xl border border-white/10 mb-6">
              <h2 className="text-5xl font-bold text-cyan-400 mb-2">Interview Completed 🎉</h2>
              <p className="text-gray-400 mb-8">
                Domain: <span className="text-white font-semibold">{quiz.domain}</span> ·{" "}
                Difficulty: <span className="text-white font-semibold">{quiz.difficulty}</span>
              </p>

              {/* ✅ FIX — Dynamic score cards from AI evaluation */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#1e293b] p-6 rounded-2xl text-center">
                  <p className="text-gray-400 mb-2 text-sm">Overall Score</p>
                  <h3 className="text-4xl font-bold text-cyan-400">
                    {result.score ?? "—"} / {quiz.questions.length}
                  </h3>
                </div>
                <div className="bg-[#1e293b] p-6 rounded-2xl text-center">
                  <p className="text-gray-400 mb-2 text-sm">Accuracy</p>
                  <h3 className="text-4xl font-bold text-green-400">
                    {result.scorePercent ?? 0}%
                  </h3>
                </div>
                <div className="bg-[#1e293b] p-6 rounded-2xl text-center">
                  <p className="text-gray-400 mb-2 text-sm">Performance</p>
                  <h3 className={`text-2xl font-bold ${
                    (result.scorePercent ?? 0) >= 80 ? "text-green-400" :
                    (result.scorePercent ?? 0) >= 50 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {result.performance ?? "—"}
                  </h3>
                </div>
              </div>

              {/* ✅ FIX — Dynamic weak areas from AI */}
              {result.weakAreas?.length > 0 && (
                <div className="bg-[#1e293b] p-6 rounded-2xl mb-6">
                  <h3 className="text-xl font-bold text-red-400 mb-4">⚠️ Weak Areas Identified</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    {result.weakAreas.map((area, i) => (
                      <li key={i}>{area}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ✅ FIX — Dynamic AI recommendation */}
              {result.recommendation && (
                <div className="bg-[#1e293b] p-6 rounded-2xl mb-6">
                  <h3 className="text-xl font-bold text-cyan-400 mb-4">🤖 AI Recommendation</h3>
                  <p className="text-gray-300 leading-relaxed">{result.recommendation}</p>
                </div>
              )}

              {/* Per-question feedback */}
              {result.feedback?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-4">📝 Question Feedback</h3>
                  <div className="space-y-4">
                    {result.feedback.map((fb, index) => (
                      <div key={index} className="bg-[#1e293b] p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-cyan-400 font-bold pr-4">
                            Q{index + 1}: {quiz.questions[index]?.question}
                          </h4>
                          <span className={`shrink-0 text-sm font-bold px-3 py-1 rounded-full ${
                            fb.score >= 7 ? "bg-green-400/20 text-green-400" :
                            fb.score >= 4 ? "bg-yellow-400/20 text-yellow-400" :
                            "bg-red-400/20 text-red-400"
                          }`}>
                            {fb.score}/10
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">
                          Your answer:{" "}
                          <span className="text-gray-300">{answers[index]}</span>
                        </p>
                        {fb.comment && (
                          <p className="text-gray-300 text-sm border-l-2 border-cyan-400 pl-3 mt-2">
                            {fb.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ✅ FIX — Action buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={resetQuiz}
                  className="flex-1 bg-cyan-400 text-black py-4 rounded-xl font-bold hover:bg-cyan-300 transition-colors"
                >
                  Take Another Quiz 🔄
                </button>
                <button
                  onClick={() => router.push("/analytics")}
                  className="flex-1 bg-white/10 text-white py-4 rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/10"
                >
                  View Analytics 📊
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}