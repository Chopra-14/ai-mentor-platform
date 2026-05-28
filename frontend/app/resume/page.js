"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";
import api, { authHeaders, getErrorMessage } from "../../lib/api";

const ROLES = ["Backend Developer", "Frontend Developer", "Full Stack Developer", "DevOps Engineer", "Data Engineer", "ML Engineer", "Mobile Developer"];

const SCORE_COLOR = (s) =>
  s >= 80 ? "text-green-400" :
  s >= 60 ? "text-yellow-400" :
  s >= 40 ? "text-orange-400" : "text-red-400";

const SCORE_BG = (s) =>
  s >= 80 ? "from-green-500/20  border-green-500/30"  :
  s >= 60 ? "from-yellow-500/20 border-yellow-500/30" :
  s >= 40 ? "from-orange-500/20 border-orange-500/30" :
            "from-red-500/20    border-red-500/30";

export default function ResumePage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [analysis,   setAnalysis]   = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [charCount,  setCharCount]  = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const analyze = async () => {
    setError("");
    if (resumeText.trim().length < 50) {
      setError("Please paste at least 50 characters of resume text.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    setLoading(true);
    setAnalysis(null);
    try {
      const res = await api.post(
        "/api/advanced/resume",
        { resumeText, targetRole },
        { headers: authHeaders() }
      );
      setAnalysis(res.data.analysis);
    } catch (err) {
      if (err.response?.status === 401) { router.push("/login"); return; }
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const score = analysis?.overall_score ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0f1f3d] to-[#1e293b] text-white flex flex-col md:flex-row">
      <AppSidebar />
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">

        {/* Header */}
        <h1 className="text-5xl font-bold mb-2">Resume Analyzer 📄</h1>
        <p className="text-gray-400 mb-10">AI-powered feedback on your resume — strengths, gaps, and interview readiness.</p>

        <div className="max-w-4xl">

          {/* Input card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
            <h2 className="text-xl font-bold mb-6">Upload Your Resume</h2>

            {/* Target role */}
            <p className="text-gray-400 text-sm mb-3">Target Role</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setTargetRole(r)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    targetRole === r
                      ? "bg-cyan-400 text-black border-cyan-400"
                      : "bg-white/5 text-gray-300 border-white/10 hover:border-cyan-400 hover:text-cyan-400"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Or type a custom role..."
              className="w-full p-3 rounded-xl bg-[#1e293b] border border-white/10 text-white outline-none focus:border-cyan-400 transition-colors mb-6"
            />

            {/* Resume textarea */}
            <p className="text-gray-400 text-sm mb-3">Resume Text</p>
            <div className="relative">
              <textarea
                rows={12}
                placeholder="Paste your resume content here — work experience, skills, education, projects..."
                value={resumeText}
                onChange={(e) => { setResumeText(e.target.value); setCharCount(e.target.value.length); }}
                className="w-full p-5 rounded-2xl bg-[#1e293b] border border-white/10 text-white outline-none focus:border-cyan-400 transition-colors resize-none"
              />
              <span className={`absolute bottom-3 right-4 text-xs ${charCount < 50 ? "text-red-400" : "text-gray-500"}`}>
                {charCount} chars {charCount < 50 ? `(need ${50 - charCount} more)` : "✓"}
              </span>
            </div>

            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

            <button
              onClick={analyze}
              disabled={loading}
              className="w-full mt-6 bg-cyan-400 text-black py-4 rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-cyan-300 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analyzing with AI...
                </span>
              ) : "Analyze Resume →"}
            </button>
          </div>

          {/* Results */}
          {analysis && (
            <div className="space-y-6">

              {/* Score hero */}
              <div className={`bg-gradient-to-br ${SCORE_BG(score)} to-transparent border rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8`}>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Overall Score</p>
                  <p className={`text-8xl font-black ${SCORE_COLOR(score)}`}>{score}</p>
                  <p className="text-gray-400 text-sm mt-1">/ 100</p>
                </div>
                <div className="flex-1">
                  <p className={`text-2xl font-bold mb-2 ${SCORE_COLOR(score)}`}>
                    {score >= 80 ? "🏆 Excellent Resume!" :
                     score >= 60 ? "👍 Good Resume" :
                     score >= 40 ? "📚 Needs Improvement" : "⚠️ Major Gaps Found"}
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {analysis.summary || `Your resume scored ${score}/100 for the ${targetRole || "target"} role. Review the sections below for detailed feedback.`}
                  </p>
                  {/* Score bar */}
                  <div className="w-full bg-[#1e293b] rounded-full h-3 mt-4">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        score >= 80 ? "bg-green-400" : score >= 60 ? "bg-yellow-400" : score >= 40 ? "bg-orange-400" : "bg-red-400"
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sections grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "✅ Strengths",      items: analysis.strengths,      color: "text-green-400",  bg: "bg-green-400/5  border-green-400/20"  },
                  { title: "🔧 Improvements",   items: analysis.improvements,   color: "text-yellow-400", bg: "bg-yellow-400/5 border-yellow-400/20" },
                  { title: "❌ Missing Skills",  items: analysis.missing_skills, color: "text-pink-400",   bg: "bg-pink-400/5   border-pink-400/20"   },
                  { title: "🎯 Action Items",    items: analysis.action_items,   color: "text-cyan-400",   bg: "bg-cyan-400/5   border-cyan-400/20"   },
                ].map((sec) => (
                  <div key={sec.title} className={`border rounded-3xl p-6 ${sec.bg}`}>
                    <h3 className={`text-lg font-bold mb-4 ${sec.color}`}>{sec.title}</h3>
                    <div className="space-y-3">
                      {sec.items?.length > 0 ? sec.items.map((item, i) => (
                        <div key={i} className="flex gap-3 items-start bg-white/5 rounded-xl p-3">
                          <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white/10 ${sec.color}`}>{i + 1}</span>
                          <p className="text-gray-300 text-sm leading-relaxed">{item}</p>
                        </div>
                      )) : (
                        <p className="text-gray-500 text-sm">None identified.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Analyze again */}
              <div className="text-center pt-4">
                <button
                  onClick={() => { setAnalysis(null); setResumeText(""); setTargetRole(""); setCharCount(0); }}
                  className="text-gray-400 hover:text-white underline text-sm transition-colors"
                >
                  Analyze a different resume
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}