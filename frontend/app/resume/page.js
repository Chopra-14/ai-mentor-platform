"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";
import api, { authHeaders, getErrorMessage } from "../../lib/api";

export default function ResumePage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    if (resumeText.trim().length < 50) {
      return alert("Paste at least 50 characters of resume text.");
    }

    setLoading(true);
    try {
      const res = await api.post(
        "/api/advanced/resume",
        { resumeText, targetRole },
        { headers: authHeaders() }
      );
      setAnalysis(res.data.analysis);
    } catch {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex flex-col md:flex-row">
      <AppSidebar />
      <div className="flex-1 p-4 md:p-10">
        <h1 className="text-5xl font-bold mb-2">Resume Analyzer 📄</h1>
        <p className="text-gray-300 mb-8">
          AI-powered feedback on strengths, gaps, and interview readiness.
        </p>

        <input
          placeholder="Target role (e.g., Backend Developer)"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="w-full max-w-xl p-4 rounded-xl bg-[#1e293b] border border-white/10 mb-4"
        />
        <textarea
          rows={12}
          placeholder="Paste your resume text here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="w-full max-w-3xl p-4 rounded-xl bg-[#1e293b] border border-white/10 mb-4"
        />
        <button
          onClick={analyze}
          disabled={loading}
          className="bg-cyan-400 text-black px-8 py-3 rounded-xl font-bold disabled:opacity-50"
        >
          {loading ? "Analyzing with AI..." : "Analyze Resume"}
        </button>

        {analysis && (
          <div className="mt-10 max-w-3xl space-y-6">
            <div className="bg-cyan-400/20 text-cyan-400 text-5xl font-bold p-8 rounded-3xl inline-block">
              {analysis.overall_score}/100
            </div>
            {[
              { title: "Strengths", items: analysis.strengths, color: "text-green-400" },
              {
                title: "Improvements",
                items: analysis.improvements,
                color: "text-yellow-400"
              },
              {
                title: "Missing Skills",
                items: analysis.missing_skills,
                color: "text-pink-400"
              },
              {
                title: "Action Items",
                items: analysis.action_items,
                color: "text-cyan-400"
              }
            ].map((section) => (
              <div key={section.title} className="bg-white/10 p-6 rounded-3xl">
                <h3 className={`text-xl font-bold mb-3 ${section.color}`}>
                  {section.title}
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-200">
                  {section.items?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
