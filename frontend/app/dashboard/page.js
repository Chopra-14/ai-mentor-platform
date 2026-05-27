"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";
import api, { authHeaders, getErrorMessage } from "../../lib/api";

const QUICK_DOMAINS = ["React", "Node.js", "Docker", "Python", "System Design", "MongoDB"];

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [userName, setUserName] = useState("Learner");
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    // Auth guard
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    // Greeting by time of day
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
    else if (hour >= 17)         setGreeting("Good Evening");

    // Decode name from JWT
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.name) setUserName(payload.name.split(" ")[0]);
    } catch {}

    const fetchStats = async () => {
      try {
        const res = await api.get("/api/dashboard/stats", { headers: authHeaders() });
        setStats(res.data);
      } catch (err) {
        if (err.response?.status === 401) { router.push("/login"); return; }
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white flex-col gap-4">
        <p className="text-red-400 text-xl">{error}</p>
        <button onClick={() => window.location.reload()} className="text-cyan-400 underline">
          Retry
        </button>
      </div>
    );
  }

  const accuracy      = stats?.accuracy ?? 0;
  const totalQuizzes  = stats?.totalQuizzes ?? 0;
  const weakTopic     = stats?.weakTopic ?? null;
  const strongTopic   = stats?.strongestTopic ?? null;
  const recentQuizzes = stats?.recentQuizzes ?? [];

  // Motivational message based on accuracy
  const motivationText =
    accuracy >= 80 ? "🔥 You're on fire! Keep pushing." :
    accuracy >= 50 ? "📈 Good progress! Stay consistent." :
    totalQuizzes === 0 ? "👋 Take your first quiz to get started!" :
    "💪 Keep going! Every quiz makes you better.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex flex-col md:flex-row">
      <AppSidebar />

      <div className="flex-1 p-6 md:p-10 overflow-y-auto">

        {/* ── WELCOME HEADER ── */}
        <div className="mb-10">
          <p className="text-gray-400 text-lg mb-1">{greeting},</p>
          <h1 className="text-5xl font-bold mb-3">
            {userName} 👋
          </h1>
          <div className="inline-block bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 px-5 py-2 rounded-full text-sm font-medium">
            {motivationText}
          </div>
        </div>

        {/* ── QUICK STATS ROW ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          <QuickStat
            icon="🎯"
            label="Overall Accuracy"
            value={`${accuracy}%`}
            color="text-cyan-400"
            bg="from-cyan-500/10 to-cyan-500/5"
          />
          <QuickStat
            icon="📝"
            label="Quizzes Taken"
            value={totalQuizzes}
            color="text-pink-400"
            bg="from-pink-500/10 to-pink-500/5"
          />
          <QuickStat
            icon="🏆"
            label="Best Topic"
            value={strongTopic ?? "N/A"}
            color="text-yellow-400"
            bg="from-yellow-500/10 to-yellow-500/5"
            small
          />
          <QuickStat
            icon="⚠️"
            label="Needs Work"
            value={weakTopic ?? "None"}
            color="text-red-400"
            bg="from-red-500/10 to-red-500/5"
            small
          />
        </div>

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

          {/* LEFT — Start Quiz + Quick Domains */}
          <div className="xl:col-span-1 flex flex-col gap-6">

            {/* Start Quiz CTA */}
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-400/30 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-2">Ready to practice? 🚀</h2>
              <p className="text-gray-400 text-sm mb-6">
                Take an AI-generated interview quiz and improve your skills.
              </p>
              <button
                onClick={() => router.push("/quiz")}
                className="w-full bg-cyan-400 text-black font-bold py-4 rounded-xl hover:bg-cyan-300 transition-colors"
              >
                Start AI Quiz →
              </button>
            </div>

            {/* Quick domain chips */}
            <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
              <h2 className="text-lg font-bold mb-4">Quick Start by Domain</h2>
              <div className="flex flex-wrap gap-2">
                {QUICK_DOMAINS.map((d) => (
                  <button
                    key={d}
                    onClick={() => router.push(`/quiz?domain=${encodeURIComponent(d)}`)}
                    className="px-3 py-2 text-sm rounded-xl bg-[#1e293b] text-gray-300 border border-white/10 hover:border-cyan-400 hover:text-cyan-400 transition-all"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation shortcuts */}
            <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
              <h2 className="text-lg font-bold mb-4">Quick Links</h2>
              <div className="space-y-2">
                {[
                  { label: "📊 Deep Analytics",     path: "/analytics"    },
                  { label: "🤖 AI Recommendations", path: "/recommendations" },
                  { label: "📚 Study Plans",         path: "/study-plan"   },
                  { label: "👤 My Profile",          path: "/profile"      },
                ].map((link) => (
                  <button
                    key={link.path}
                    onClick={() => router.push(link.path)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-[#1e293b] text-gray-300 hover:text-white hover:bg-[#263548] transition-all text-sm"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Recent Activity + Progress Snapshot */}
          <div className="xl:col-span-2 flex flex-col gap-6">

            {/* Weekly goal progress */}
            <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">Weekly Goal Progress</h2>
                <span className="text-cyan-400 font-bold">{stats?.weeklyGoal ?? 0}%</span>
              </div>
              <div className="w-full bg-[#1e293b] rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-4 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(stats?.weeklyGoal ?? 0, 100)}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm">
                {stats?.weeklyGoal >= 100
                  ? "🎉 Weekly goal complete!"
                  : `Complete more quizzes to hit your weekly target.`}
              </p>
            </div>

            {/* Recent quiz activity */}
            <div className="bg-white/10 border border-white/10 rounded-3xl p-6 flex-1">
              <h2 className="text-lg font-bold mb-4">Recent Quiz Activity</h2>

              {recentQuizzes.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-gray-400">No quizzes yet.</p>
                  <button
                    onClick={() => router.push("/quiz")}
                    className="mt-4 text-cyan-400 text-sm underline"
                  >
                    Take your first quiz!
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentQuizzes.slice(0, 5).map((q, i) => (
                    <div
                      key={q._id || i}
                      className="flex items-center justify-between bg-[#1e293b] px-5 py-4 rounded-2xl"
                    >
                      <div>
                        <p className="font-semibold text-white">{q.domain}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {q.difficulty} · {new Date(q.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric"
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${
                          (q.totalScore ?? 0) >= 7 ? "text-green-400" :
                          (q.totalScore ?? 0) >= 4 ? "text-yellow-400" : "text-red-400"
                        }`}>
                          {q.totalScore ?? "—"}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weak topic alert */}
            {weakTopic && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6">
                <h2 className="text-lg font-bold text-red-400 mb-2">
                  ⚠️ Focus Area: {weakTopic}
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Your scores in <span className="text-white font-semibold">{weakTopic}</span> are
                  below average. Practice it today to improve your overall accuracy.
                </p>
                <button
                  onClick={() => router.push(`/quiz?domain=${encodeURIComponent(weakTopic)}`)}
                  className="bg-red-400 text-black font-bold px-5 py-2 rounded-xl text-sm hover:bg-red-300 transition-colors"
                >
                  Practice {weakTopic} Now →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ icon, label, value, color, bg, small }) {
  return (
    <div className={`bg-gradient-to-br ${bg} border border-white/10 rounded-3xl p-5`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className={`font-bold ${color} ${small ? "text-xl" : "text-3xl"} truncate`}>
        {value}
      </p>
    </div>
  );
}
