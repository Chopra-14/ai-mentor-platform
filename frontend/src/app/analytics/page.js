"use client";

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

const performanceData = [
  { day: "Mon", score: 45 },
  { day: "Tue", score: 62 },
  { day: "Wed", score: 70 },
  { day: "Thu", score: 82 },
  { day: "Fri", score: 88 },
  { day: "Sat", score: 91 }
];

const domainData = [
  {
    domain: "AI/ML",
    accuracy: 82
  },
  {
    domain: "DevOps",
    accuracy: 63
  },
  {
    domain: "System Design",
    accuracy: 74
  }
];

const weakTopics = [
  {
    name: "Kubernetes",
    value: 40
  },
  {
    name: "Docker",
    value: 25
  },
  {
    name: "CI/CD",
    value: 35
  }
];

const COLORS = [
  "#22d3ee",
  "#f472b6",
  "#4ade80"
];

export default function AnalyticsPage() {

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] text-white p-10">

      {/* Heading */}

      <div className="mb-10">

        <h1 className="text-6xl font-bold mb-4">
          Analytics Dashboard 📊
        </h1>

        <p className="text-gray-400 text-xl">
          Monitor your AI learning performance
        </p>

      </div>

      {/* Top Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white/10 p-6 rounded-3xl shadow-2xl">

          <h2 className="text-gray-300 text-lg">
            AI/ML Accuracy
          </h2>

          <p className="text-5xl font-bold text-cyan-400 mt-4">
            82%
          </p>

        </div>

        <div className="bg-white/10 p-6 rounded-3xl shadow-2xl">

          <h2 className="text-gray-300 text-lg">
            DevOps Accuracy
          </h2>

          <p className="text-5xl font-bold text-pink-400 mt-4">
            63%
          </p>

        </div>

        <div className="bg-white/10 p-6 rounded-3xl shadow-2xl">

          <h2 className="text-gray-300 text-lg">
            Weakest Topic
          </h2>

          <p className="text-4xl font-bold text-yellow-400 mt-4">
            Kubernetes
          </p>

        </div>

        <div className="bg-white/10 p-6 rounded-3xl shadow-2xl">

          <h2 className="text-gray-300 text-lg">
            Current Streak
          </h2>

          <p className="text-5xl font-bold text-green-400 mt-4">
            14 🔥
          </p>

        </div>

      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Line Chart */}

        <div className="bg-white/10 p-8 rounded-3xl shadow-2xl">

          <h2 className="text-3xl font-bold mb-6">
            Weekly Improvement
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <LineChart data={performanceData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="day" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="score"
                stroke="#22d3ee"
                strokeWidth={4}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

        {/* Bar Chart */}

        <div className="bg-white/10 p-8 rounded-3xl shadow-2xl">

          <h2 className="text-3xl font-bold mb-6">
            Domain Performance
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={domainData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="domain" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="accuracy"
                fill="#4ade80"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* Pie Chart */}

      <div className="mt-10 bg-white/10 p-8 rounded-3xl shadow-2xl">

        <h2 className="text-3xl font-bold mb-8">
          Weak Areas Analysis
        </h2>

        <div className="flex justify-center">

          <ResponsiveContainer width="100%" height={400}>

            <PieChart>

              <Pie
                data={weakTopics}
                cx="50%"
                cy="50%"
                outerRadius={130}
                dataKey="value"
                label
              >

                {
                  weakTopics.map(
                    (entry, index) => (

                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />

                    )
                  )
                }

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}