"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";
import api, { authHeaders, getErrorMessage } from "../../lib/api";

const LANGUAGES = [
  { name: "JavaScript", icon: "🟨" },
  { name: "Python",     icon: "🐍" },
  { name: "Java",       icon: "☕" },
  { name: "TypeScript", icon: "🔷" },
  { name: "Go",         icon: "🐹" },
  { name: "C++",        icon: "⚙️" },
  { name: "Rust",       icon: "🦀" },
  { name: "SQL",        icon: "🗄️" },
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const DIFF_STYLE = {
  Beginner:     "bg-green-400/20  text-green-400  border-green-400/30",
  Intermediate: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
  Advanced:     "bg-red-400/20    text-red-400    border-red-400/30",
};

const FALLBACK = (lang, diff) => [
  {
    title: `${lang} Data Structures`,
    difficulty: diff || "Beginner",
    description: `Implement and manipulate core data structures in ${lang}. Focus on arrays, linked lists, and hash maps.`,
    hints: ["Start with the simplest case", "Think about time complexity", "Handle edge cases (empty, single element)"],
    sample_solution_outline: `Define the data structure, implement insert/delete/search operations, then test with edge cases.`
  },
  {
    title: `${lang} Algorithm Challenge`,
    difficulty: diff || "Intermediate",
    description: `Solve a classic algorithmic problem in ${lang}. Implement sorting, searching, or graph traversal.`,
    hints: ["Break the problem into smaller steps", "Consider recursion vs iteration", "Optimize after you have a working solution"],
    sample_solution_outline: `Understand the input/output, choose the right algorithm, implement it step by step, then optimize.`
  },
  {
    title: `${lang} Real-World Project`,
    difficulty: diff || "Advanced",
    description: `Build a mini real-world feature in ${lang} — such as a REST API, CLI tool, or data processor.`,
    hints: ["Design the architecture first", "Separate concerns into functions/modules", "Add proper error handling and logging"],
    sample_solution_outline: `Plan the feature, scaffold the project, implement core logic, add tests, then refactor for clean code.`
  },
];

export default function ChallengesPage() {
  const router = useRouter();

  const [language,   setLanguage]   = useState("JavaScript");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [challenges, setChallenges] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [expanded,   setExpanded]   = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generate = async () => {
    setError("");
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    setLoading(true);
    setChallenges([]);
    setExpanded(null);

    try {
      const res = await api.post(
        "/api/advanced/coding-challenges",
        { language, difficulty },
        { headers: authHeaders() }
      );
      setChallenges(res.data.challenges?.length ? res.data.challenges : FALLBACK(language, difficulty));
    } catch (err) {
      if (err.response?.status === 401) { router.push("/login"); return; }
      // Use fallback on any error (quota, network etc.)
      setChallenges(FALLBACK(language, difficulty));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0f1f3d] to-[#1e293b] text-white flex flex-col md:flex-row">
      <AppSidebar />
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">

        {/* Header */}
        <h1 className="text-5xl font-bold mb-2">Coding Challenges 💻</h1>
        <p className="text-gray-400 mb-10">AI-generated practice problems tailored to your skill level.</p>

        {/* Config card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10 max-w-3xl">
          <h2 className="text-xl font-bold mb-6">Configure Challenge</h2>

          {/* Language chips */}
          <p className="text-gray-400 text-sm mb-3">Programming Language</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {LANGUAGES.map((l) => (
              <button
                key={l.name}
                onClick={() => setLanguage(l.name)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all flex items-center gap-2 ${
                  language === l.name
                    ? "bg-cyan-400 text-black border-cyan-400"
                    : "bg-white/5 text-gray-300 border-white/10 hover:border-cyan-400 hover:text-cyan-400"
                }`}
              >
                <span>{l.icon}</span>{l.name}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <p className="text-gray-400 text-sm mb-3">Difficulty</p>
          <div className="flex gap-3 mb-6">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-6 py-2 rounded-full font-bold text-sm border transition-all ${
                  difficulty === d
                    ? DIFF_STYLE[d]
                    : "bg-white/5 text-gray-300 border-white/10 hover:border-white/30"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            onClick={generate}
            disabled={loading}
            className="w-full bg-cyan-400 text-black py-4 rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-cyan-300 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Generating Challenges...
              </span>
            ) : `Generate ${language} Challenges →`}
          </button>
        </div>

        {/* Challenges */}
        {challenges.length > 0 && (
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{challenges.length} Challenges Generated</h2>
              <span className="text-gray-400 text-sm">{language} · {difficulty}</span>
            </div>

            <div className="space-y-4">
              {challenges.map((c, i) => {
                const isOpen = expanded === i;
                const diffStyle = DIFF_STYLE[c.difficulty] || DIFF_STYLE.Intermediate;
                return (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden transition-all duration-300"
                  >
                    {/* Challenge header — always visible */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : i)}
                      className="w-full text-left p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg font-black text-cyan-400">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{c.title}</h3>
                          <p className="text-gray-400 text-sm mt-0.5 line-clamp-1">{c.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${diffStyle}`}>
                          {c.difficulty}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div className="px-6 pb-6 border-t border-white/5 pt-5">
                        <p className="text-gray-300 leading-relaxed mb-6">{c.description}</p>

                        {/* Hints */}
                        <div className="mb-6">
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">💡 Hints</p>
                          <div className="space-y-2">
                            {c.hints?.map((h, j) => (
                              <div key={j} className="flex gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-4 py-3">
                                <span className="text-yellow-400 font-bold shrink-0">{j + 1}.</span>
                                <p className="text-gray-300 text-sm">{h}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Solution outline */}
                        <div>
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">🗺️ Solution Approach</p>
                          <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-xl px-5 py-4">
                            <p className="text-gray-300 text-sm leading-relaxed">{c.sample_solution_outline}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => { setChallenges([]); setExpanded(null); }}
                className="text-gray-400 hover:text-white underline text-sm transition-colors"
              >
                Generate new challenges
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}