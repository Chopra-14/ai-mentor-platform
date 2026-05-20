"use client";

import {
  FaBrain,
  FaChartLine,
  FaUserGraduate,
  FaBook
} from "react-icons/fa";
import Link from "next/link";
export default function Dashboard() {

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex">

      {/* Sidebar */}

      <div className="w-full md:w-64 bg-white/10 backdrop-blur-lg border-r border-white/10 p-6">

        <h1 className="text-3xl font-bold mb-10 text-cyan-400">
          AI Mentor
        </h1>
<div className="space-y-5 text-lg">

  <Link
    href="/dashboard"
    className="block hover:text-cyan-400 transition"
  >
    Dashboard
  </Link>

  <Link
    href="/quiz"
    className="block hover:text-cyan-400 transition"
  >
    Quiz
  </Link>

  <Link
    href="/analytics"
    className="block hover:text-cyan-400 transition"
  >
    Analytics
  </Link>

  <Link
    href="/profile"
    className="block hover:text-cyan-400 transition"
  >
    Profile
  </Link>

</div>

      </div>

      {/* Main Content */}

      <div className="flex-1 p-4 md:p-10">

        {/* Header */}

        <div className="flex justify-between items-center mb-10">

          <div>

            <h1 className="text-5xl font-bold">
              Welcome Back 👋
            </h1>

            <p className="text-gray-300 mt-2">
              Track your AI learning journey
            </p>

          </div>

          <div className="w-14 h-14 rounded-full bg-cyan-400 flex items-center justify-center text-black font-bold text-xl">
            S
          </div>

        </div>

        {/* Cards */}

        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        

          {/* Card 1 */}

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:scale-105 transition duration-300 shadow-2xl">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-300">
                  Current Level
                </p>

                <h2 className="text-4xl font-bold mt-3">
                  Advanced
                </h2>

              </div>

              <FaBrain size={40} className="text-cyan-400" />

            </div>

          </div>

          {/* Card 2 */}

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:scale-105 transition duration-300 shadow-2xl">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-300">
                  Average Score
                </p>

                <h2 className="text-4xl font-bold mt-3">
                  88%
                </h2>

              </div>

              <FaChartLine size={40} className="text-green-400" />

            </div>

          </div>

          {/* Card 3 */}

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:scale-105 transition duration-300 shadow-2xl">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-300">
                  Weak Topic
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  Kubernetes
                </h2>

              </div>

              <FaBook size={40} className="text-pink-400" />

            </div>

          </div>

        </div>

        {/* Progress Section */}

        <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-3xl font-bold">
              Weekly Progress
            </h2>

            <FaUserGraduate size={35} className="text-yellow-400" />

          </div>

          <div className="space-y-6">

            <div>

              <div className="flex justify-between mb-2">
                <span>DevOps</span>
                <span>88%</span>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-4">

                <div className="bg-cyan-400 h-4 rounded-full w-[88%]"></div>

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">
                <span>AI/ML</span>
                <span>74%</span>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-4">

                <div className="bg-pink-400 h-4 rounded-full w-[74%]"></div>

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">
                <span>System Design</span>
                <span>61%</span>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-4">

                <div className="bg-green-400 h-4 rounded-full w-[61%]"></div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}