"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import AppSidebar from "../../components/AppSidebar";

import api, {
  authHeaders,
  getErrorMessage
} from "../../lib/api";

export default function StudyPlanPage() {

  const router = useRouter();

  const [weeks, setWeeks] = useState(4);

  const [domain, setDomain] =
    useState("");

  const [plan, setPlan] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const generatePlan = async () => {

    const token =
      localStorage.getItem("token");

    if (!token) {

      return router.push("/login");

    }

    if (!domain) {

      return alert(
        "Please enter a domain"
      );

    }

    setLoading(true);

    try {

      const res = await api.post(
        "/api/studyplan/generate",
        {
          weeks,
          domain
        },
        {
          headers: authHeaders()
        }
      );

      setPlan({

        summary:
          `A ${weeks}-week roadmap focused on ${domain}.`,

        weeks: res.data.plan.map(
          (item) => ({

            week: item.week,

            focus: item.focus,

            tasks: item.tasks,

            resources:
              item.resources

          })
        )

      });

    } catch (err) {

      alert(
        getErrorMessage(err)
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex flex-col md:flex-row">

      <AppSidebar />

      <div className="flex-1 p-4 md:p-10">

        <h1 className="text-5xl font-bold mb-2">

          AI Study Plan 📚

        </h1>

        <p className="text-gray-300 mb-8">

          Personalized weekly roadmap
          based on your domains,
          goals, and weak topics.

        </p>

        {/* Inputs */}

        <div className="bg-white/10 p-6 rounded-3xl mb-8 max-w-2xl flex flex-col md:flex-row gap-4 items-end">

          {/* Domain */}

          <div className="w-full">

            <label className="text-gray-400 text-sm">

              Domain

            </label>

            <input
              type="text"
              placeholder="React / DevOps / Python"
              value={domain}
              onChange={(e) =>
                setDomain(
                  e.target.value
                )
              }
              className="w-full mt-2 p-3 rounded-xl bg-[#1e293b] border border-white/10"
            />

          </div>

          {/* Weeks */}

          <div className="w-full">

            <label className="text-gray-400 text-sm">

              Weeks

            </label>

            <input
              type="number"
              min={1}
              max={12}
              value={weeks}
              onChange={(e) =>
                setWeeks(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-full mt-2 p-3 rounded-xl bg-[#1e293b] border border-white/10"
            />

          </div>

          {/* Button */}

          <button
            onClick={generatePlan}
            disabled={loading}
            className="bg-cyan-400 text-black px-6 py-3 rounded-xl font-bold disabled:opacity-50 whitespace-nowrap"
          >

            {loading
              ? "Generating..."
              : "Generate Plan"}

          </button>

        </div>

        {/* Plan */}

        {plan && (

          <div className="space-y-6">

            {/* Overview */}

            <div className="bg-white/10 p-6 rounded-3xl">

              <h2 className="text-2xl font-bold mb-3">

                Overview

              </h2>

              <p className="text-gray-300 leading-relaxed">

                {plan.summary}

              </p>

            </div>

            {/* Weeks */}

            {plan.weeks?.map((w) => (

              <div
                key={w.week}
                className="bg-white/10 p-6 rounded-3xl"
              >

                <h3 className="text-xl font-bold text-cyan-400 mb-2">

                  Week {w.week}: {w.focus}

                </h3>

                {/* Tasks */}

                <p className="text-gray-400 mb-3 font-medium">

                  Tasks

                </p>

                <ul className="list-disc list-inside space-y-1 mb-4 text-gray-200">

                  {w.tasks?.map(
                    (t, i) => (

                      <li key={i}>
                        {t}
                      </li>

                    )
                  )}

                </ul>

                {/* Resources */}

                <p className="text-gray-400 mb-2 font-medium">

                  Resources

                </p>

                <ul className="list-disc list-inside space-y-1 text-gray-300">

                  {w.resources?.map(
                    (r, i) => (

                      <li key={i}>
                        {r}
                      </li>

                    )
                  )}

                </ul>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}