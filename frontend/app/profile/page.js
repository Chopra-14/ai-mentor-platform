"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";
import api, { authHeaders, getErrorMessage } from "../../lib/api";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" }
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    api
      .get("/api/profile/me", { headers: authHeaders() })
      .then((res) => setUser(res.data.user))
      .catch(() => router.push("/login"));

    api
      .get("/api/dashboard/stats", { headers: authHeaders() })
      .then((res) => setShowAdmin(!!res.data.isAdmin))
      .catch(() => {});
  }, [router]);

  const saveLanguage = async (code) => {
    const token = localStorage.getItem("token");
    setSaving(true);
    try {
      const res = await api.patch(
        "/api/profile/me",
        { preferred_language: code },
        { headers: authHeaders() }
      );
      setUser(res.data.user);
    } catch {
      alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex flex-col md:flex-row">
      <AppSidebar showAdmin={showAdmin} />
      <div className="flex-1 p-4 md:p-10">
        <h1 className="text-5xl font-bold mb-10">User Profile 👤</h1>

        <div className="bg-white/10 rounded-3xl p-10 max-w-2xl border border-white/10">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-24 h-24 rounded-full bg-cyan-400 flex items-center justify-center text-4xl font-bold text-black uppercase">
              {user.name?.[0] || "U"}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{user.name}</h2>
              <p className="text-gray-300">AI Learning Enthusiast</p>
            </div>
          </div>

          <div className="space-y-5 text-xl">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Domains:</strong>{" "}
              {user.domains?.length ? user.domains.join(", ") : "Not set"}
            </p>
            <p>
              <strong>Difficulty:</strong> {user.difficulty_level || user.level}
            </p>
            <p>
              <strong>Average Score:</strong> {user.average_score?.toFixed?.(1) || user.average_score || 0}
            </p>
            <p>
              <strong>Weak Topics:</strong>{" "}
              {user.weak_topics?.length ? user.weak_topics.join(", ") : "None"}
            </p>
            <p>
              <strong>Goals:</strong>{" "}
              {user.goals?.length ? user.goals.join(", ") : "Not set"}
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-white/10">
            <h3 className="text-xl font-bold mb-4">🌐 Multilingual AI Responses</h3>
            <p className="text-gray-400 text-sm mb-4">
              Quizzes, study plans, and resume feedback will use your selected language.
            </p>
            <div className="flex flex-wrap gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => saveLanguage(lang.code)}
                  disabled={saving}
                  className={`px-4 py-2 rounded-xl border transition ${
                    user.preferred_language === lang.code
                      ? "bg-cyan-400 text-black border-cyan-400"
                      : "border-white/20 hover:border-cyan-400"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
