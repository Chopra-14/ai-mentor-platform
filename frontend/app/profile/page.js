"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";
import api, { authHeaders, getErrorMessage } from "../../lib/api";

const LEVEL_CONFIG = {
  Advanced:     { color: "text-green-400",  bg: "bg-green-400/10  border-green-400/30",  bar: "bg-green-400",  pct: 100 },
  Intermediate: { color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30", bar: "bg-yellow-400", pct: 60  },
  Beginner:     { color: "text-cyan-400",   bg: "bg-cyan-400/10   border-cyan-400/30",   bar: "bg-cyan-400",   pct: 25  },
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    const load = async () => {
      try {
        const [profRes, statsRes] = await Promise.all([
          api.get("/api/profile",         { headers: authHeaders() }),
          api.get("/api/dashboard/stats", { headers: authHeaders() }),
        ]);
        setProfile(profRes.data);
        setStats(statsRes.data);
      } catch (err) {
        if (err.response?.status === 401) { router.push("/login"); return; }
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading profile...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white flex-col gap-4">
      <p className="text-red-400 text-xl">{error}</p>
      <button onClick={() => window.location.reload()} className="text-cyan-400 underline">Retry</button>
    </div>
  );

  const level  = profile?.difficulty_level || "Beginner";
  const lConf  = LEVEL_CONFIG[level] || LEVEL_CONFIG.Beginner;
  const initials = (profile?.name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const accuracy = stats?.accuracy ?? profile?.average_score ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0f1f3d] to-[#1e293b] text-white flex flex-col md:flex-row">
      <AppSidebar />
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">

        <h1 className="text-5xl font-bold mb-10">My Profile 👤</h1>

        <div className="max-w-4xl grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── LEFT: Avatar card ── */}
          <div className="xl:col-span-1 flex flex-col gap-6">

            {/* Avatar */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl font-black text-black mb-4">
                {initials}
              </div>
              <h2 className="text-2xl font-bold mb-1">{profile?.name || "N/A"}</h2>
              <p className="text-gray-400 text-sm mb-4">{profile?.email || "N/A"}</p>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${lConf.bg} ${lConf.color}`}>
                {level}
              </span>
            </div>

            {/* Level progress */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">Level Progress</p>
              <div className="space-y-3">
                {Object.entries(LEVEL_CONFIG).reverse().map(([lvl, conf]) => (
                  <div key={lvl}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={conf.color}>{lvl}</span>
                      <span className="text-gray-500">{conf.pct}%</span>
                    </div>
                    <div className="w-full bg-[#1e293b] rounded-full h-2">
                      <div
                        className={`${conf.bar} h-2 rounded-full transition-all duration-700`}
                        style={{ width: level === lvl ? `${Math.min(accuracy, 100)}%` : level === "Advanced" && conf.pct < 100 ? "100%" : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Stats + details ── */}
          <div className="xl:col-span-2 flex flex-col gap-6">

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Accuracy",       value: `${accuracy}%`,                    color: "text-cyan-400"   },
                { label: "Total Quizzes",  value: stats?.totalQuizzes ?? 0,          color: "text-pink-400"   },
                { label: "Weekly Goal",    value: `${stats?.weeklyGoal ?? 0}%`,       color: "text-green-400"  },
                { label: "Best Topic",     value: stats?.strongestTopic ?? "N/A",    color: "text-yellow-400", small: true },
                { label: "Weak Topic",     value: stats?.weakTopic ?? "None",        color: "text-red-400",    small: true },
                { label: "Readiness",      value: stats?.interviewReadiness ?? "—",  color: "text-violet-400", small: true },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                  <p className={`font-bold ${s.color} ${s.small ? "text-lg" : "text-2xl"} truncate`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Account info */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-5">Account Details</p>
              <div className="space-y-4">
                {[
                  { label: "Full Name",        value: profile?.name           || "N/A"      },
                  { label: "Email",            value: profile?.email          || "N/A"      },
                  { label: "Difficulty Level", value: level,                  color: lConf.color },
                  { label: "Average Score",    value: `${profile?.average_score ?? 0} / 10` },
                  { label: "Role",             value: profile?.role           || "Student"  },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-gray-400 text-sm">{row.label}</span>
                    <span className={`font-semibold text-sm ${row.color || "text-white"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak topics */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-5">
                ⚠️ Weak Topics to Improve
              </p>
              {profile?.weak_topics?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profile.weak_topics.map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => router.push(`/quiz?domain=${encodeURIComponent(topic)}`)}
                      className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-500/20 transition-colors"
                    >
                      {topic} → Practice
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No weak topics identified yet. Take more quizzes!</p>
              )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => router.push("/quiz")}       className="bg-cyan-400 text-black py-4 rounded-2xl font-bold hover:bg-cyan-300 transition-colors">Start Quiz 🚀</button>
              <button onClick={() => router.push("/analytics")}  className="bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-bold hover:bg-white/20 transition-colors">View Analytics 📊</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}