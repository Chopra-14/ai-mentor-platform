"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";
import api, { authHeaders, getErrorMessage } from "../../lib/api";

export default function StudyPlanPage() {
  const router = useRouter();
  const [weeks, setWeeks] = useState(4);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {

  const token = localStorage.getItem("token");

  if (!token) {
    return router.push("/login");
  }

  setLoading(true);

  try {

    const res = await api.post(
      "/api/studyplan/generate",
      {
        weeks,
        domain: "React"
      },
      {
        headers: authHeaders()
      }
    );

    setPlan({
      summary: `A ${weeks}-week plan focused on React.`,
      weeks: res.data.plan.map((item) => ({
        week: item.week,
        focus: item.focus,
        tasks: item.tasks,
        resources: item.resources
      }))
    });

  } catch (err) {

    alert(getErrorMessage(err));

  } finally {

    setLoading(false);

  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex flex-col md:flex-row">
      <AppSidebar />
      <div className="flex-1 p-4 md:p-10">
        <h1 className="text-5xl font-bold mb-2">AI Study Plan 📚</h1>
        <p className="text-gray-300 mb-8">
          Personalized weekly roadmap based on your domains, goals, and weak topics.
        </p>

        <div className="bg-white/10 p-6 rounded-3xl mb-8 max-w-md flex gap-4 items-end">
          <div>
            <label className="text-gray-400 text-sm">Weeks</label>
            <input
              type="number"
              min={1}
              max={12}
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
              className="w-full mt-2 p-3 rounded-xl bg-[#1e293b] border border-white/10"
            />
          </div>
          <button
            onClick={generatePlan}
            disabled={loading}
            className="bg-cyan-400 text-black px-6 py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Plan"}
          </button>
        </div>

        {plan && (
          <div className="space-y-6">
            <div className="bg-white/10 p-6 rounded-3xl">
              <h2 className="text-2xl font-bold mb-3">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{plan.summary}</p>
            </div>
            {plan.weeks?.map((w) => (
              <div key={w.week} className="bg-white/10 p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-cyan-400 mb-2">
                  Week {w.week}: {w.focus}
                </h3>
                <p className="text-gray-400 mb-3 font-medium">Tasks</p>
                <ul className="list-disc list-inside space-y-1 mb-4 text-gray-200">
                  {w.tasks?.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
                <p className="text-gray-400 mb-2 font-medium">Resources</p>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {w.resources?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
