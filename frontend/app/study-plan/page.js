"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";
import api, { authHeaders, getErrorMessage } from "../../lib/api";

const DOMAINS = [
  { name: "React",         icon: "⚛️" },
  { name: "Node.js",       icon: "🟢" },
  { name: "Python",        icon: "🐍" },
  { name: "DevOps",        icon: "⚙️" },
  { name: "System Design", icon: "🏗️" },
  { name: "Docker",        icon: "🐳" },
  { name: "MongoDB",       icon: "🍃" },
  { name: "JavaScript",   icon: "🟨" },
];

const WEEK_OPTIONS = [2, 4, 6, 8, 12];

const WEEK_COLORS = [
  "from-cyan-500/20 border-cyan-500/30 text-cyan-400",
  "from-violet-500/20 border-violet-500/30 text-violet-400",
  "from-pink-500/20 border-pink-500/30 text-pink-400",
  "from-green-500/20 border-green-500/30 text-green-400",
  "from-yellow-500/20 border-yellow-500/30 text-yellow-400",
  "from-orange-500/20 border-orange-500/30 text-orange-400",
  "from-blue-500/20 border-blue-500/30 text-blue-400",
  "from-red-500/20 border-red-500/30 text-red-400",
];

export default function StudyPlanPage() {
  const router = useRouter();

  const [domain, setDomain]   = useState("");
  const [weeks, setWeeks]     = useState(4);
  const [plan, setPlan]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [activeWeek, setActiveWeek] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generatePlan = async () => {
    setError("");
    if (!domain.trim()) {
      setError("Please select or enter a domain.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    setLoading(true);
    setPlan(null);
    setActiveWeek(0);

    try {
      const res = await api.post(
        "/api/studyplan/generate",
        { weeks, domain },
        { headers: authHeaders() }
      );
      setPlan(res.data.plan);
    } catch (err) {
      if (err.response?.status === 401) { router.push("/login"); return; }
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const currentWeek = plan?.[activeWeek];
  const colorClass  = WEEK_COLORS[activeWeek % WEEK_COLORS.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0f1f3d] to-[#1e293b] text-white flex flex-col md:flex-row">
      <AppSidebar />

      <div className="flex-1 p-6 md:p-10 overflow-y-auto">

        {/* ── HEADER ── */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-2">AI Study Plan 📚</h1>
          <p className="text-gray-400">
            Get a personalized week-by-week roadmap for any domain.
          </p>
        </div>

        {/* ── INPUT CARD ── */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10 max-w-3xl">
          <h2 className="text-xl font-bold mb-6">Configure Your Plan</h2>

          {/* Domain chips */}
          <p className="text-gray-400 text-sm mb-3">Choose a Domain</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {DOMAINS.map((d) => (
              <button
                key={d.name}
                onClick={() => { setDomain(d.name); setError(""); }}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all flex items-center gap-2 ${
                  domain === d.name
                    ? "bg-cyan-400 text-black border-cyan-400"
                    : "bg-white/5 text-gray-300 border-white/10 hover:border-cyan-400 hover:text-cyan-400"
                }`}
              >
                <span>{d.icon}</span> {d.name}
              </button>
            ))}
          </div>

          {/* Custom domain input */}
          <input
            type="text"
            value={domain}
            onChange={(e) => { setDomain(e.target.value); setError(""); }}
            placeholder="Or type a custom domain..."
            className="w-full p-3 rounded-xl bg-[#1e293b] border border-white/10 text-white outline-none focus:border-cyan-400 transition-colors mb-6"
          />

          {/* Week selector */}
          <p className="text-gray-400 text-sm mb-3">Number of Weeks</p>
          <div className="flex gap-3 mb-6 flex-wrap">
            {WEEK_OPTIONS.map((w) => (
              <button
                key={w}
                onClick={() => setWeeks(w)}
                className={`px-5 py-2 rounded-full font-bold text-sm border transition-all ${
                  weeks === w
                    ? "bg-cyan-400 text-black border-cyan-400"
                    : "bg-white/5 text-gray-300 border-white/10 hover:border-cyan-400"
                }`}
              >
                {w}W
              </button>
            ))}
            <input
              type="number"
              min={1} max={52}
              value={weeks}
              onChange={(e) => setWeeks(Math.min(52, Math.max(1, Number(e.target.value))))}
              className="w-20 p-2 rounded-xl bg-[#1e293b] border border-white/10 text-white text-center outline-none focus:border-cyan-400"
            />
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            onClick={generatePlan}
            disabled={loading}
            className="w-full bg-cyan-400 text-black py-4 rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-cyan-300 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Generating Your Roadmap...
              </span>
            ) : `Generate ${weeks}-Week Roadmap →`}
          </button>
        </div>

        {/* ── PLAN DISPLAY ── */}
        {plan && (
          <div className="max-w-5xl">

            {/* Summary bar */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-3xl p-6 mb-8 flex flex-wrap gap-6 items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Your Roadmap</p>
                <h2 className="text-2xl font-bold">{domain} · {weeks} Weeks</h2>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-cyan-400">{plan.length}</p>
                  <p className="text-gray-400 text-xs">Weeks</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-pink-400">
                    {plan.reduce((a, w) => a + (w.tasks?.length ?? 0), 0)}
                  </p>
                  <p className="text-gray-400 text-xs">Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">
                    {plan.reduce((a, w) => a + (w.resources?.length ?? 0), 0)}
                  </p>
                  <p className="text-gray-400 text-xs">Resources</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* LEFT — Week selector timeline */}
              <div className="xl:col-span-1">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sticky top-6">
                  <p className="text-gray-400 text-sm font-semibold mb-4 px-2">TIMELINE</p>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {plan.map((w, i) => {
                      const col = WEEK_COLORS[i % WEEK_COLORS.length];
                      const accent = col.split(" ")[2]; // text color
                      return (
                        <button
                          key={w.week}
                          onClick={() => setActiveWeek(i)}
                          className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${
                            activeWeek === i
                              ? `bg-gradient-to-r ${col} border-opacity-50`
                              : "bg-white/5 border-white/5 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/10 ${activeWeek === i ? accent : "text-gray-400"}`}>
                              W{w.week}
                            </span>
                            <span className={`text-sm font-semibold truncate ${activeWeek === i ? "text-white" : "text-gray-300"}`}>
                              {w.focus}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT — Week detail card */}
              <div className="xl:col-span-2">
                {currentWeek && (
                  <div className={`bg-gradient-to-br ${colorClass.split(" ")[0]} to-transparent border ${colorClass.split(" ")[1]} rounded-3xl p-8`}>

                    {/* Week header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black ${colorClass.split(" ")[2]}`}>
                        {currentWeek.week}
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Week {currentWeek.week}</p>
                        <h3 className="text-2xl font-bold">{currentWeek.focus}</h3>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="mb-8">
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
                        ✅ Tasks This Week
                      </p>
                      <div className="space-y-3">
                        {currentWeek.tasks?.map((task, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 bg-white/5 rounded-2xl px-5 py-4 border border-white/5"
                          >
                            <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white/10 ${colorClass.split(" ")[2]}`}>
                              {i + 1}
                            </span>
                            <p className="text-gray-200 text-sm leading-relaxed">{task}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
                        📖 Learning Resources
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {currentWeek.resources?.map((r, i) => (
                          <span
                            key={i}
                            className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-gray-300 text-sm font-medium"
                          >
                            🔗 {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-4 mt-10">
                      <button
                        onClick={() => setActiveWeek((p) => Math.max(0, p - 1))}
                        disabled={activeWeek === 0}
                        className="flex-1 py-3 rounded-xl bg-white/10 text-gray-300 font-bold disabled:opacity-30 hover:bg-white/20 transition-colors"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setActiveWeek((p) => Math.min(plan.length - 1, p + 1))}
                        disabled={activeWeek === plan.length - 1}
                        className="flex-1 py-3 rounded-xl bg-cyan-400 text-black font-bold disabled:opacity-30 hover:bg-cyan-300 transition-colors"
                      >
                        Next Week →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Generate new plan */}
            <div className="mt-8 text-center">
              <button
                onClick={() => { setPlan(null); setDomain(""); setWeeks(4); }}
                className="text-gray-400 hover:text-white underline text-sm transition-colors"
              >
                Generate a different plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}