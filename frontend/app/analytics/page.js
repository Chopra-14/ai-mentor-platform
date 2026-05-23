"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { authHeaders } from "../../lib/api";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#22d3ee", "#f472b6", "#4ade80", "#facc15", "#c084fc"];

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get("/api/dashboard/stats", {
          headers: authHeaders()
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">Loading analytics...</div>;
  }

  // Transform data for charts
  const performanceData = stats?.recentQuizzes?.slice().reverse().map((q, i) => {
    const totalScore = q.questions.reduce((sum, qs) => sum + (qs.score || 0), 0);
    const maxScore = q.questions.length * 10;
    return { day: `Quiz ${i+1}`, score: ((totalScore/maxScore)*100).toFixed(0) };
  }) || [];

  const domainData = Object.entries(stats?.domainStats || {}).map(([domain, data]) => ({
    domain,
    accuracy: ((data.total / (data.count * 10)) * 100).toFixed(0)
  }));

  const weakTopics = Object.entries(stats?.domainStats || {})
    .map(([domain, data]) => ({
      name: domain,
      value: 100 - ((data.total / (data.count * 10)) * 100)
    }))
    .filter(t => t.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // top 5 weak topics

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] text-white p-10 relative">
      <Link href="/dashboard" className="absolute top-10 left-10 text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
        <FaArrowLeft /> Back to Dashboard
      </Link>
      
      {/* Heading */}
      <div className="mb-10 text-center mt-12">
        <h1 className="text-6xl font-bold mb-4">Analytics Dashboard 📊</h1>
        <p className="text-gray-400 text-xl">Monitor your AI learning performance</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 max-w-6xl mx-auto">
        <div className="bg-white/10 p-6 rounded-3xl shadow-2xl">
          <h2 className="text-gray-300 text-lg">Overall Accuracy</h2>
          <p className="text-5xl font-bold text-cyan-400 mt-4">{stats?.overallAccuracy || 0}%</p>
        </div>
        <div className="bg-white/10 p-6 rounded-3xl shadow-2xl">
          <h2 className="text-gray-300 text-lg">Total Quizzes</h2>
          <p className="text-5xl font-bold text-pink-400 mt-4">{stats?.recentQuizzes?.length || 0}</p>
        </div>
        <div className="bg-white/10 p-6 rounded-3xl shadow-2xl">
          <h2 className="text-gray-300 text-lg">Weakest Topic</h2>
          <p className="text-4xl font-bold text-yellow-400 mt-4 capitalize">{stats?.weakestTopic || "None"}</p>
        </div>
        <div className="bg-white/10 p-6 rounded-3xl shadow-2xl">
          <h2 className="text-gray-300 text-lg">Current Streak</h2>
          <p className="text-5xl font-bold text-green-400 mt-4">{stats?.streak || 0} 🔥</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Line Chart */}
        <div className="bg-white/10 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-6">Recent Improvement</h2>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={4} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">Take a few quizzes to see your progress graph!</p>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white/10 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-6">Domain Performance</h2>
          {domainData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={domainData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="domain" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="accuracy" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <p className="text-gray-400">Take quizzes in different domains to see this data.</p>
          )}
        </div>
      </div>

      {/* Pie Chart */}
      <div className="mt-10 bg-white/10 p-8 rounded-3xl shadow-2xl max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Weak Areas Analysis (Error Rate)</h2>
        <div className="flex justify-center">
          {weakTopics.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={weakTopics}
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {weakTopics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No weak areas identified yet. Great job!</p>
          )}
        </div>
      </div>
    </div>
  );
}