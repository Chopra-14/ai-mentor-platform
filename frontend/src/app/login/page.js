"use client";

import { useState } from "react";
import axios from "axios";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const handleLogin = async () => {

  console.log("Login button clicked");

  try {

    const response = await axios.post(
  `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
  {
        email,
        password
      }
    );

    console.log(response.data);

    localStorage.setItem(
      "token",
      response.data.token
    );

    window.location.href = "/dashboard";

  } catch (error) {

    console.log(error);

    alert("Login Failed");

  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-96">

        <h1 className="text-3xl font-bold mb-6 text-center">
          AI Learning Assistant
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 mb-4 rounded-lg"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 mb-4 rounded-lg"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-3 rounded-lg"
        >
          Login
        </button>

      </div>

    </div>
  );
}