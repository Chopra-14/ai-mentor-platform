"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";
import api, { authHeaders, getErrorMessage } from "../../lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, RadialBarChart, RadialBar, LineChart,
  Line, Legend
} from "recharts";

export default function AnalyticsPage() {
  const router = useRouter();

  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    const fetchAnalytics = async () => {
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

    fetchAnalytics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-400">Crunching your data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white flex-col gap-4">
        <p className="text-red-400 text-xl">{error}</p>
        <button onClick={() => window.location.reload()} className="text-violet-400 underline">
          Retry
        </button>
      </div>
    );
  }

  const accuracy        = stats?.accuracy ?? 0;
  const totalQuizzes    = stats?.totalQuizzes ?? 0;
  const domainProgress  = stats?.domainProgress ?? [];
  const recommendations = stats?.recommendations ?? [];

  const radialData = [{ name: "Accuracy", value: accuracy, fill: "#8b5cf6" }];

  const barData = domainProgress.map((d) => ({
    domain: d.domain,
    score: d.score
  }));

  const trendData = stats?.scoreTrend ?? [
    { quiz: "Q1", score: 0 },
    { quiz: "Q2", score: 0 },
    { quiz: "Q3", score: 0 },
    { quiz: "Q4", score: 0 },
    { quiz: "Q5", score: accuracy }
  ];

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#1e1b4b",
      border: "1px solid rgba(139,92,246,0.3)",
      borderRadius: "12px",
      color: "#fff"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1a0e3a] to-[#1e293b] text-white flex flex-col md:flex-row">
      <AppSidebar />

      <div className="flex-1 p-6 md:p-10 overflow-y-auto">

        <h1 className="text-5xl font-bold mb-2">Deep Analytics 📈</h1>
        <p className="text-gray-400 mb-10">
          A full breakdown of your performance, trends, and weak spots.
        </p>

        {/* TOP METRIC CARDS */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          <MetricCard label="Overall Accuracy"    value={`${accuracy}%`}                          color="text-violet-400" icon="🎯" />
          <MetricCard label="Total Quizzes"        value={totalQuizzes}                             color="text-pink-400"   icon="📝" />
          <MetricCard label="Learning Level"       value={stats?.learningLevel ?? "Beginner"}       color="text-cyan-400"   icon="🧠" />
          <MetricCard label="Interview Readiness"  value={stats?.interviewReadiness ?? "Starting"}  color="text-green-400"  icon="💼" />
        </div>

        {/* CHARTS ROW 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

          {/* Accuracy Radial Gauge */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-1">Accuracy Gauge</h2>
            <p className="text-gray-500 text-sm mb-6">Your overall quiz accuracy at a glance.</p>

            {totalQuizzes === 0 ? (
              <EmptyChart message="Take a quiz to see your accuracy gauge." />
            ) : (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="55%" height={220}>
                  <RadialBarChart
                    innerRadius="60%"
                    outerRadius="90%"
                    data={radialData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "#1e1b4b" }} />
                    <Tooltip {...tooltipStyle} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div>
                  <p className="text-6xl font-bold text-violet-400">{accuracy}%</p>
                  <p className="text-gray-400 mt-2 text-sm">
                    {accuracy >= 80 ? "Excellent 🏆" :
                     accuracy >= 60 ? "Good 👍" :
                     accuracy >= 40 ? "Average 📚" : "Needs Work 💪"}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Based on {totalQuizzes} quiz{totalQuizzes !== 1 ? "zes" : ""}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Domain Score Bar Chart */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-1">Score by Domain</h2>
            <p className="text-gray-500 text-sm mb-6">Compare your performance across topics.</p>

            {barData.length === 0 ? (
              <EmptyChart message="Complete quizzes in different domains to see this chart." />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="domain" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip {...tooltipStyle} formatter={(val) => [`${val}%`, "Score"]} />
                  <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* SCORE TREND LINE CHART */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-1">Score Trend Over Time</h2>
          <p className="text-gray-500 text-sm mb-6">Track how your performance changes quiz by quiz.</p>

          {totalQuizzes < 2 ? (
            <EmptyChart message="Take at least 2 quizzes to see your score trend." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="quiz" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip {...tooltipStyle} formatter={(val) => [`${val}%`, "Score"]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* DOMAIN PROGRESS BARS with color-coded badges */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-1">Domain Progress Breakdown</h2>
          <p className="text-gray-500 text-sm mb-6">Detailed accuracy per topic with visual bars.</p>

          {domainProgress.length === 0 ? (
            <EmptyChart message="Take quizzes in different domains to see your progress." />
          ) : (
            <div className="space-y-5">
              {domainProgress.map((item, index) => {
                const pct = Math.min(item.score ?? 0, 100);
                const barColor   = pct >= 80 ? "bg-green-400"  : pct >= 50 ? "bg-yellow-400"  : "bg-red-400";
                const textColor  = pct >= 80 ? "text-green-400": pct >= 50 ? "text-yellow-400": "text-red-400";
                const badgeColor = pct >= 80 ? "bg-green-400/20 text-green-400"
                                 : pct >= 50 ? "bg-yellow-400/20 text-yellow-400"
                                 :             "bg-red-400/20 text-red-400";
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{item.domain}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badgeColor}`}>
                          {pct >= 80 ? "Strong" : pct >= 50 ? "Average" : "Weak"}
                        </span>
                      </div>
                      <span className={`font-bold ${textColor}`}>{pct}%</span>
                    </div>
                    <div className="w-full bg-[#1e1b4b] rounded-full h-3">
                      <div className={`${barColor} h-3 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI RECOMMENDATIONS + FULL PERFORMANCE TABLE */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-1">AI Recommendations 🤖</h2>
            <p className="text-gray-500 text-sm mb-6">Personalized advice based on your quiz data.</p>
            <div className="space-y-3">
              {recommendations.length === 0 ? (
                <p className="text-gray-400 text-sm">Complete a quiz to unlock personalized AI recommendations.</p>
              ) : (
                recommendations.map((item, i) => (
                  <div key={i} className="flex gap-3 bg-[#1e1b4b] p-4 rounded-2xl">
                    <span className="text-violet-400 font-bold shrink-0">{i + 1}.</span>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {typeof item === "string" ? item : item.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-1">Full Performance Summary</h2>
            <p className="text-gray-500 text-sm mb-6">Every metric in one place.</p>
            <div className="space-y-4">
              {[
                { label: "Overall Accuracy",   value: `${accuracy}%`,                          color: "text-violet-400" },
                { label: "Total Quizzes",       value: totalQuizzes,                             color: "text-pink-400"   },
                { label: "Strongest Topic",     value: stats?.strongestTopic ?? "N/A",           color: "text-green-400"  },
                { label: "Weakest Topic",       value: stats?.weakTopic ?? "None",               color: "text-red-400"    },
                { label: "Learning Level",      value: stats?.learningLevel ?? "Beginner",       color: "text-cyan-400"   },
                { label: "Interview Readiness", value: stats?.interviewReadiness ?? "—",         color: "text-yellow-400" },
                { label: "Weekly Goal",         value: `${stats?.weeklyGoal ?? 0}%`,             color: "text-orange-400" },
                { label: "Average Score",       value: `${stats?.averageScore ?? 0}%`,           color: "text-violet-400" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-gray-400 text-sm">{row.label}</span>
                  <span className={`font-bold text-sm ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ label, value, color, icon }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:bg-white/10 transition-colors">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color} truncate`}>{value}</p>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="h-[180px] flex flex-col items-center justify-center text-center">
      <p className="text-4xl mb-3">📊</p>
      <p className="text-gray-400 text-sm max-w-xs">{message}</p>
    </div>
  );
}
