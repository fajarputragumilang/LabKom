"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MdSpaceDashboard,
  MdEventNote,
  MdSchedule,
  MdComputer,
  MdInsertChartOutlined,
  MdSettings,
  MdLogout,
  MdNotificationsNone,
} from "react-icons/md";
import { FaUser } from "react-icons/fa6";

const MENU_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: MdSpaceDashboard },
  { name: "Pemesanan", path: "/dashboard/booking", icon: MdEventNote },
  { name: "Jadwal Lab", path: "/dashboard/schedule", icon: MdSchedule },
  { name: "Daftar Komputer", path: "/dashboard/computers", icon: MdComputer },
  { name: "Laporan", path: "/dashboard/reports", icon: MdInsertChartOutlined },
  { name: "Pengaturan", path: "/dashboard/settings", icon: MdSettings },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  // PERBAIKAN 1: Tambahkan state isLoading agar aplikasi tidak "nyangkut"
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem("user");

        if (userData) {
          // JIKA BERHASIL: Set user dan matikan loading
          setUser(JSON.parse(userData));
          setIsLoading(false);
        } else {
          // JIKA GAGAL (LocalStorage kosong tapi middleware lolos):
          console.warn(
            "Desinkronisasi sesi terdeteksi. Memaksa pembersihan cookie...",
          );
          await fetch("/api/logout", { method: "POST" });
          window.location.href = "/login";
        }
      } catch (error) {
        // JIKA JSON CORRUPT / ERROR LAINNYA:
        console.error("Gagal mem-parsing data user", error);
        localStorage.removeItem("user");
        await fetch("/api/logout", { method: "POST" });
        window.location.href = "/login";
      }
      // CATATAN: Blok finally dihilangkan agar tidak memicu auto-logout pada user yang valid
    };

    checkAuth();
  }, []); // Dependensi kosong agar hanya berjalan sekali saat mount

  const handleLogout = async () => {
    setIsLoading(true); // Tampilkan loading saat proses logout
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const isActive = (path) => pathname === path;

  // PERBAIKAN 2: Tampilkan UI Loading yang proper, jangan langsung return null
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="mt-4 text-gray-600 font-medium">Memuat sistem...</span>
      </div>
    );
  }

  // Jika tidak loading tapi user kosong (sedang proses redirect ke login)
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-poppins flex flex-col lg:flex-row">
      {/* SIDEBAR (DESKTOP) */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary min-h-screen fixed left-0 top-0 text-white z-20">
        <div className="h-24 flex items-center px-6 gap-3 border-b border-white/10">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1 shadow-md shrink-0">
            <div className="relative w-full h-full">
              <Image
                src="/LOGODB.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base leading-tight">
              Lab Komputer
            </span>
            <span className="text-xs text-white/70">Sistem Pemesanan</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {MENU_ITEMS.map((item) => (
            <Link key={item.name} href={item.path}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                  isActive(item.path)
                    ? "bg-white/10 border-l-4 border-warning text-white font-semibold"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="text-xl" />
                <span className="text-sm">{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-danger hover:bg-red-700 text-white py-3 rounded-lg transition-colors font-semibold text-sm shadow-md"
          >
            <MdLogout className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* HEADER MOBILE */}
      <header className="lg:hidden fixed top-0 w-full bg-primary h-16 flex items-center justify-between px-3 z-30 shadow-md">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <button
            onClick={handleLogout}
            className="shrink-0 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            title="Logout"
          >
            <MdLogout className="text-2xl rotate-180" />
          </button>

          <div className="shrink-0 w-9 h-9 bg-white rounded-full flex items-center justify-center p-1">
            <div className="relative w-full h-full">
              <Image
                src="/LOGODB.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col text-white ml-1 overflow-hidden">
            <span className="font-bold text-sm leading-tight truncate">
              Lab Komputer
            </span>
            <span className="text-[10px] text-white/70 truncate">
              SMKS Doa Bangsa
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-white shrink-0">
          <button className="relative p-1">
            <MdNotificationsNone className="text-2xl" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>
          <div className="w-8 h-8 bg-white/20 rounded-full border border-white/40 overflow-hidden flex items-center justify-center">
            <FaUser className="text-white text-sm" />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <div className="hidden lg:flex justify-end items-center px-8 h-24 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-5">
            <button className="relative text-gray-400 hover:text-primary transition-colors">
              <MdNotificationsNone className="text-2xl" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-5 border-l border-gray-300 cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-gray-800 truncate max-w-[150px]">
                  {user.username}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {user.role || "User"}
                </span>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full border border-gray-300 overflow-hidden flex items-center justify-center shadow-sm shrink-0">
                <FaUser className="text-gray-400 text-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">{children}</div>
      </main>

      {/* BOTTOM NAVIGATION MOBILE */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-between items-center h-16 px-4 z-30 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {[
          { name: "Dashboard", path: "/dashboard", icon: MdSpaceDashboard },
          { name: "Pesan", path: "/dashboard/booking", icon: MdEventNote },
          { name: "Jadwal", path: "/dashboard/schedule", icon: MdSchedule },
          { name: "Komputer", path: "/dashboard/computers", icon: MdComputer },
          { name: "Lainnya", path: "/dashboard/settings", icon: MdSettings },
        ].map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="flex-1 flex justify-center"
          >
            <div
              className={`flex flex-col items-center justify-center w-full space-y-1 ${
                isActive(item.path) ||
                (item.path === "/dashboard/settings" &&
                  isActive("/dashboard/reports"))
                  ? "text-primary"
                  : "text-gray-400 hover:text-primary"
              }`}
            >
              <item.icon className="text-2xl" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
