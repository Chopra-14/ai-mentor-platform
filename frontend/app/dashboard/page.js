"use client";

import { useEffect, useState } from "react";
import {
  FaBrain,
  FaChartLine,
  FaUserGraduate,
  FaBook
} from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
        setShowAdmin(!!res.data.isAdmin);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
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
    return <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex flex-col md:flex-row">
      <AppSidebar showAdmin={showAdmin} />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold">Welcome Back 👋</h1>
            <p className="text-gray-300 mt-2">Track your AI learning journey</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-cyan-400 flex items-center justify-center text-black font-bold text-xl uppercase">
            U
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:scale-105 transition duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Accuracy</p>
                <h2 className="text-4xl font-bold mt-3">{stats?.overallAccuracy || 0}%</h2>
              </div>
              <FaChartLine size={40} className="text-green-400" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:scale-105 transition duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Weak Topic</p>
                <h2 className="text-3xl font-bold mt-3 capitalize">{stats?.weakestTopic || "None"}</h2>
              </div>
              <FaBook size={40} className="text-pink-400" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:scale-105 transition duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Current Streak</p>
                <h2 className="text-4xl font-bold mt-3">{stats?.streak || 0} Days</h2>
              </div>
              <FaBrain size={40} className="text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Domain Progress</h2>
            <FaUserGraduate size={35} className="text-yellow-400" />
          </div>
          <div className="space-y-6">
            {stats?.domainStats && Object.keys(stats.domainStats).length > 0 ? (
              Object.entries(stats.domainStats).map(([domain, data], i) => {
                const acc = ((data.total / (data.count * 10)) * 100).toFixed(0);
                const colors = ["bg-cyan-400", "bg-pink-400", "bg-green-400", "bg-yellow-400"];
                const color = colors[i % colors.length];
                return (
                  <div key={domain}>
                    <div className="flex justify-between mb-2">
                      <span className="capitalize">{domain}</span>
                      <span>{acc}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div className={`${color} h-4 rounded-full`} style={{ width: `${acc}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400">No quiz data available yet. Go take a quiz!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}