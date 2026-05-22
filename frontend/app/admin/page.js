"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      })
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
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        Loading admin panel...
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
            className="text-cyan-400 underline"
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/10 p-6 rounded-3xl">
            <p className="text-gray-400">Total Users</p>
            <p className="text-4xl font-bold text-cyan-400">{data.userCount}</p>
          </div>
          <div className="bg-white/10 p-6 rounded-3xl">
            <p className="text-gray-400">Total Quizzes</p>
            <p className="text-4xl font-bold text-pink-400">{data.quizCount}</p>
          </div>
          <div className="bg-white/10 p-6 rounded-3xl">
            <p className="text-gray-400">Recommendations</p>
            <p className="text-4xl font-bold text-green-400">
              {data.recommendationCount}
            </p>
          </div>
          <div className="bg-white/10 p-6 rounded-3xl">
            <p className="text-gray-400">Platform Accuracy</p>
            <p className="text-4xl font-bold text-yellow-400">
              {data.platformAccuracy}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white/10 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">Quizzes by Domain</h2>
            {domainChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={domainChart}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="domain" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="count" fill="#22d3ee" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No quiz data yet.</p>
            )}
          </div>

          <div className="bg-white/10 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">Recent Signups</h2>
            {data.signupsByDay?.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.signupsByDay}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="_id" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="count" fill="#4ade80" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No signup trend data.</p>
            )}
          </div>
        </div>

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
                {data.users?.map((u) => (
                  <tr key={u._id} className="border-b border-white/5">
                    <td className="py-3">{u.name}</td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3">{u.difficulty_level || u.level}</td>
                    <td className="py-3 capitalize">{u.role || "user"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white/10 p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-4">Recent Quiz Activity</h2>
          <div className="space-y-3">
            {data.recentQuizzes?.map((q) => (
              <div
                key={q._id}
                className="flex justify-between items-center bg-[#1e293b] p-4 rounded-xl"
              >
                <span>
                  {q.user?.name || "User"} — {q.domain} ({q.difficulty})
                </span>
                <span className="text-gray-400 text-sm">
                  {new Date(q.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
