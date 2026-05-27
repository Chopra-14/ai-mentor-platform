"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";
import api, {
  authHeaders,
  getErrorMessage
} from "../../lib/api";

export default function ProfilePage() {

  const router = useRouter();

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const fetchProfile =
      async () => {

        const token =
          localStorage.getItem("token");

        if (!token) {
          return router.push("/login");
        }

        try {

          const res = await api.get(
            "/api/profile",
            {
              headers:
                authHeaders()
            }
          );

          setProfile(res.data);

        } catch (err) {

          alert(
            getErrorMessage(err)
          );

        } finally {

          setLoading(false);

        }

      };

    fetchProfile();

  }, [router]);

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white text-2xl">
        Loading Profile...
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex flex-col md:flex-row">

      <AppSidebar />

      <div className="flex-1 p-4 md:p-10">

        <h1 className="text-5xl font-bold mb-8">
          My Profile 👤
        </h1>

        <div className="bg-white/10 p-8 rounded-3xl border border-white/10 max-w-3xl space-y-6">

          <div>

            <p className="text-gray-400 mb-1">
              Name
            </p>

            <h2 className="text-2xl font-bold">
              {profile?.name || "N/A"}
            </h2>

          </div>

          <div>

            <p className="text-gray-400 mb-1">
              Email
            </p>

            <h2 className="text-xl">
              {profile?.email || "N/A"}
            </h2>

          </div>

          <div>

            <p className="text-gray-400 mb-1">
              Difficulty Level
            </p>

            <h2 className="text-xl text-cyan-400">
              {profile?.difficulty_level || "Beginner"}
            </h2>

          </div>

          <div>

            <p className="text-gray-400 mb-1">
              Average Score
            </p>

            <h2 className="text-xl">
              {profile?.average_score || 0}
            </h2>

          </div>

          <div>

            <p className="text-gray-400 mb-2">
              Weak Topics
            </p>

            <div className="flex flex-wrap gap-3">

              {profile?.weak_topics?.length > 0
                ? profile.weak_topics.map(
                    (topic, i) => (
                      <span
                        key={i}
                        className="bg-red-500/20 text-red-300 px-4 py-2 rounded-full"
                      >
                        {topic}
                      </span>
                    )
                  )
                : (
                  <span className="text-gray-400">
                    No weak topics yet
                  </span>
                )}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}