// Lokasi: /src/app/login/page.jsx
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Tetap reset error saat mencoba login kembali
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        try {
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (e) {}

        // Delay 150ms untuk transisi yang cepat dan mulus
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 150);
      } else {
        // Notifikasi error dipertahankan
        setError(data.error || "Login gagal, periksa kredensial Anda.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem saat menghubungi server.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-2">Login</h1>
          <p className="text-gray-600 text-sm font-medium">
            Sistem Pengelolaan Lab Komputer
          </p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
