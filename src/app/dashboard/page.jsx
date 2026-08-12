"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardHome() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter(); // Gunakan router bawaan Next.js

  useEffect(() => {
    setMounted(true);

    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id) {
          setUser(parsed);
          // Bersihkan URL dari parameter cache-buster agar terlihat rapi
          window.history.replaceState(null, "", "/dashboard");
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.replace("/login");
  };

  // Mencegah hydration error dengan menahan render
  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
        Memverifikasi sesi dashboard...
      </div>
    );
  }

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
            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg font-semibold transition cursor-pointer"
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
              className="inline-block w-full text-center bg-blue-600 text-white font-bold px-4 py-3 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              Buka Modul Booking &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
