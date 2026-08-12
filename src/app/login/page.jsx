"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Gunakan router bawaan Next.js

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setSuccess("Login berhasil! Menyiapkan dashboard...");

        // Simpan sesi ke localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        // Menyegarkan state data Next.js di background
        router.refresh();

        // Pindah menggunakan Next.js Router dengan Cache Buster halus
        setTimeout(() => {
          router.push(`/dashboard?_t=${Date.now()}`);
        }, 300);
      } else {
        setError(data.error || "Login gagal, periksa kredensial Anda.");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem saat menghubungi server.");
    } finally {
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
            <br />
            SMKS Doa Bangsa
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm text-center font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              UserName
            </label>
            <input
              type="text"
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Masukkan username"
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
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-all cursor-pointer"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
