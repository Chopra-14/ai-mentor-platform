"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";
import api, {
  authHeaders,
  getErrorMessage
} from "../../lib/api";

export default function ChallengesPage() {

  const router = useRouter();

  const [language, setLanguage] =
    useState("JavaScript");

  const [difficulty, setDifficulty] =
    useState("");

  const [challenges, setChallenges] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const generate = async () => {

    const token =
      localStorage.getItem("token");

    if (!token) {
      return router.push("/login");
    }

    setLoading(true);

    try {

      let challengesData = [];

      try {

        const res = await api.post(
          "/api/advanced/coding-challenges",
          {
            language,
            difficulty:
              difficulty || undefined
          },
          {
            headers: authHeaders()
          }
        );

        challengesData =
          res.data.challenges;

      } catch {

        challengesData = [
          {
            title:
              `${language} Arrays Challenge`,
            difficulty:
              difficulty || "Beginner",

            description:
              `Practice array manipulation using ${language}.`,

            hints: [
              "Use loops",
              "Practice indexing",
              "Try edge cases"
            ],

            sample_solution_outline:
              "Traverse the array and apply the required logic step by step."
          },

          {
            title:
              `${language} API Challenge`,

            difficulty:
              difficulty || "Intermediate",

            description:
              `Build a small API integration project using ${language}.`,

            hints: [
              "Use fetch or axios",
              "Handle errors properly",
              "Display loading states"
            ],

            sample_solution_outline:
              "Fetch data from an API and render results dynamically."
          },

          {
            title:
              `${language} Mini Project`,

            difficulty:
              difficulty || "Advanced",

            description:
              `Create a mini real-world project using ${language}.`,

            hints: [
              "Break into components",
              "Use reusable logic",
              "Optimize performance"
            ],

            sample_solution_outline:
              "Design the project structure first, then implement features one by one."
          }
        ];

      }

      setChallenges(challengesData);

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
          Coding Challenges 💻
        </h1>

        <p className="text-gray-300 mb-8">
          AI-generated practice problems aligned with your skill level.
        </p>

        <div className="flex flex-wrap gap-4 mb-8">

          <input
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value)
            }
            placeholder="Language"
            className="p-3 rounded-xl bg-[#1e293b] border border-white/10 outline-none"
          />

          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value)
            }
            className="p-3 rounded-xl bg-[#1e293b] border border-white/10 outline-none"
          >

            <option value="">
              Auto (from profile)
            </option>

            <option value="Beginner">
              Beginner
            </option>

            <option value="Intermediate">
              Intermediate
            </option>

            <option value="Advanced">
              Advanced
            </option>

          </select>

          <button
            onClick={generate}
            disabled={loading}
            className="bg-cyan-400 text-black px-6 py-3 rounded-xl font-bold disabled:opacity-50"
          >

            {loading
              ? "Generating..."
              : "Generate Challenges"}

          </button>

        </div>

        <div className="grid gap-6 max-w-4xl">

          {challenges.map((c, i) => (

            <div
              key={i}
              className="bg-white/10 p-6 rounded-3xl border border-white/10"
            >

              <div className="flex justify-between items-start mb-3">

                <h3 className="text-2xl font-bold text-cyan-400">
                  {c.title}
                </h3>

                <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
                  {c.difficulty}
                </span>

              </div>

              <p className="text-gray-300 mb-4">
                {c.description}
              </p>

              <p className="text-gray-400 text-sm font-medium mb-2">
                Hints
              </p>

              <ul className="list-disc list-inside text-gray-300 mb-4">

                {c.hints?.map((h, j) => (
                  <li key={j}>
                    {h}
                  </li>
                ))}

              </ul>

              <p className="text-gray-400 text-sm font-medium mb-1">
                Solution outline
              </p>

              <p className="text-gray-200">
                {c.sample_solution_outline}
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}