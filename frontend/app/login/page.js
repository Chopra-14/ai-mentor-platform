"use client";

import { useState } from "react";
import api, { getErrorMessage } from "../../lib/api";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await api.post("/api/auth/signup", {
          name: name || "Student",
          email,
          password,
          domains: ["General"],
          level: "Beginner"
        });
        localStorage.setItem("token", res.data.token);
      } else {
        const res = await api.post("/api/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/10"
      >
        <h1 className="text-3xl font-bold mb-2 text-center text-cyan-400">
          AI Learning Assistant
        </h1>
        <p className="text-center text-gray-400 mb-6">
          {mode === "login" ? "Sign in to continue" : "Create your account"}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}

        {mode === "signup" && (
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            suppressHydrationWarning
            className="w-full p-3 mb-4 rounded-lg bg-[#1e293b] border border-white/10 outline-none focus:border-cyan-400"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          suppressHydrationWarning
          className="w-full p-3 mb-4 rounded-lg bg-[#1e293b] border border-white/10 outline-none focus:border-cyan-400"
        />

        <input
          type="password"
          placeholder="Password (min 6 characters)"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          suppressHydrationWarning
          className="w-full p-3 mb-4 rounded-lg bg-[#1e293b] border border-white/10 outline-none focus:border-cyan-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-400 text-black p-3 rounded-lg font-bold hover:bg-cyan-300 disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Login"
              : "Sign Up"}
        </button>

        <p className="text-center mt-6 text-gray-400 text-sm">
          {mode === "login" ? (
            <>
              No account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-cyan-400 underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-cyan-400 underline"
              >
                Login
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}