"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardHome() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let sessionData = null;
    try {
      const localData = localStorage.getItem("user");
      if (localData && localData !== "undefined") sessionData = localData;
    } catch (e) {}

    if (!sessionData) {
      const cookies = document.cookie.split(";");
      const userCookie = cookies.find((c) =>
        c.trim().startsWith("session_user="),
      );
      if (userCookie)
        sessionData = decodeURIComponent(userCookie.split("=")[1]);
    }

    if (sessionData) setUser(JSON.parse(sessionData));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    try {
      localStorage.removeItem("user");
    } catch (e) {}
    window.location.href = "/login";
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center font-semibold text-gray-500 bg-gray-50">
        Menyiapkan Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">
              Selamat Datang, {user.nama || user.username}!
            </h1>
            <p className="text-gray-600 mt-1">
              Role:{" "}
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {user.role}
              </span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="border border-blue-100 rounded-xl p-6 hover:shadow-lg transition bg-blue-50">
            <h2 className="text-xl font-bold text-blue-800 mb-2">
              Manajemen Booking Lab
            </h2>
            <p className="text-gray-700 mb-6 text-sm">
              Kelola, buat, dan lakukan validasi persetujuan peminjaman
              Laboratorium Komputer.
            </p>
            <Link
              href="/dashboard/booking"
              className="inline-block w-full text-center bg-blue-600 text-white font-bold px-4 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Buka Modul Booking &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
