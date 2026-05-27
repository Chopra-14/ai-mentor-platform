"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { authHeaders } from "../../lib/api";
import AppSidebar from "../../components/AppSidebar";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ✅ FIX — Redirect if no token
    if (!token) {
      router.push("/login");
      return;
    }

    // ✅ FIX — Frontend role check before making any API call
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "admin") {
        router.push("/dashboard");
        return;
      }
    } catch {
      router.push("/login");
      return;
    }

    api
      .get("/api/admin/overview", { headers: authHeaders() })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 403) {
          setError("You do not have admin access.");
        } else if (err.response?.status === 401) {
          router.push("/login");
        } else {
          setError("Failed to load admin data.");
        }
      })
      .finally(() => setLoading(false));

  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // ✅ FIX — Empty deps array (removed router to prevent re-runs)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-bold">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white p-10 text-center">
        <div>
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-cyan-400 underline hover:text-cyan-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const domainChart = Object.entries(data?.domainCounts || {}).map(
    ([domain, count]) => ({ domain, count })
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex flex-col md:flex-row">
      <AppSidebar showAdmin />
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <h1 className="text-5xl font-bold mb-2">Admin Panel 🛡️</h1>
        <p className="text-gray-300 mb-10">Platform monitoring and user analytics</p>

        {/* STAT CARDS — ✅ FIX: ?? fallbacks so no crash if data is null */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard label="Total Users"       value={data?.userCount ?? 0}            color="text-cyan-400"   />
          <StatCard label="Total Quizzes"     value={data?.quizCount ?? 0}            color="text-pink-400"   />
          <StatCard label="Recommendations"   value={data?.recommendationCount ?? 0}  color="text-green-400"  />
          <StatCard label="Platform Accuracy" value={`${data?.platformAccuracy ?? 0}%`} color="text-yellow-400" />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white/10 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">Quizzes by Domain</h2>
            {domainChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={domainChart}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="domain" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }} />
                  <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No quiz data yet.</p>
            )}
          </div>

          <div className="bg-white/10 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">Recent Signups</h2>
            {data?.signupsByDay?.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.signupsByDay}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  {/* ✅ FIX — Format _id date string into readable label */}
                  <XAxis
                    dataKey="_id"
                    stroke="#94a3b8"
                    tickFormatter={(val) =>
                      new Date(val).toLocaleDateString("en-US", {
                        month: "short", day: "numeric"
                      })
                    }
                  />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
                    labelFormatter={(val) =>
                      new Date(val).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric"
                      })
                    }
                  />
                  <Bar dataKey="count" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No signup trend data.</p>
            )}
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="bg-white/10 p-8 rounded-3xl mb-8">
          <h2 className="text-2xl font-bold mb-4">Registered Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Level</th>
                  <th className="pb-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {data?.users?.map((u) => (
                  <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3">{u.name}</td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3">{u.difficulty_level || u.level || "—"}</td>
                    <td className="py-3 capitalize">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-cyan-400/20 text-cyan-400"
                          : "bg-white/10 text-gray-300"
                      }`}>
                        {u.role || "user"}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* ✅ FIX — Empty state for users table */}
                {(!data?.users || data.users.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      No users registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT QUIZ ACTIVITY */}
        <div className="bg-white/10 p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-4">Recent Quiz Activity</h2>
          <div className="space-y-3">
            {data?.recentQuizzes?.map((q) => (
              <div
                key={q._id}
                className="flex justify-between items-center bg-[#1e293b] p-4 rounded-xl hover:bg-[#263548] transition-colors"
              >
                <span>
                  <span className="text-cyan-400 font-semibold">{q.user?.name || "User"}</span>
                  {" — "}{q.domain}
                  <span className="text-gray-400 text-sm ml-2">({q.difficulty})</span>
                </span>
                <span className="text-gray-400 text-sm">
                  {new Date(q.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric"
                  })}
                </span>
              </div>
            ))}
            {/* ✅ FIX — Empty state for quiz activity */}
            {(!data?.recentQuizzes || data.recentQuizzes.length === 0) && (
              <p className="text-gray-400 text-center py-4">No quiz activity yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white/10 p-6 rounded-3xl hover:bg-white/15 transition-colors">
      <p className="text-gray-400 mb-2">{label}</p>
      <p className={`text-4xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
