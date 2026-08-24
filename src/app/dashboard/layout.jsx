// Lokasi: /src/app/dashboard/layout.jsx
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
import { FaUser, FaLock } from "react-icons/fa6";

// Konfigurasi Navigasi
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

  // Ambil data user dari LocalStorage saat render pertama
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Jika tidak ada sesi, tendang kembali ke login
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const isActive = (path) => pathname === path;

  // Render null sementara mengecek sesi agar tidak ada kedipan (flicker)
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-poppins flex flex-col lg:flex-row">
      {/* 
        =========================================
        SIDEBAR (KHUSUS DESKTOP)
        =========================================
      */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary min-h-screen fixed left-0 top-0 text-white z-20">
        {/* Header Sidebar (Logo & Nama Aplikasi) */}
        <div className="h-24 flex items-center px-6 gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1 shadow-md">
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

        {/* Menu List */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
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

        {/* Logout Button di bawah */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-danger hover:bg-red-700 text-white py-3 rounded-lg transition-colors font-semibold text-sm"
          >
            <MdLogout className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 
        =========================================
        HEADER MOBILE (KHUSUS MOBILE)
        =========================================
      */}
      <header className="lg:hidden fixed top-0 w-full bg-primary h-16 flex items-center justify-between px-4 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
            <div className="relative w-full h-full">
              <Image
                src="/LOGODB.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col text-white">
            <span className="font-bold text-sm leading-tight">
              Lab Komputer
            </span>
            <span className="text-[10px] text-white/70">Sistem Pemesanan</span>
          </div>
        </div>

        {/* Profile & Bell (Mobile) */}
        <div className="flex items-center gap-3 text-white">
          <button className="relative p-1">
            <MdNotificationsNone className="text-2xl" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>
          <div className="w-8 h-8 bg-white/20 rounded-full border border-white/40 overflow-hidden flex items-center justify-center">
            {/* Bisa diganti avatar asli jika ada */}
            <FaUser className="text-white text-sm" />
          </div>
        </div>
      </header>

      {/* 
        =========================================
        MAIN CONTENT AREA
        =========================================
      */}
      {/* lg:ml-64 untuk memberi ruang bagi sidebar desktop. pt-16 untuk ruang header mobile. pb-20 untuk ruang bottom nav mobile */}
      <main className="flex-1 flex flex-col lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        {/* Topbar Kanan (KHUSUS DESKTOP) */}
        <div className="hidden lg:flex justify-end items-center px-8 h-20">
          <div className="flex items-center gap-5">
            <button className="relative text-grey hover:text-primary transition-colors">
              <MdNotificationsNone className="text-2xl" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-danger rounded-full border-2 border-[#F8F9FA]"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-300 cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-black-80">
                  {user.username}
                </span>
                <span className="text-xs text-grey capitalize">
                  {user.role || "User"}
                </span>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full border border-gray-300 overflow-hidden flex items-center justify-center">
                <FaUser className="text-gray-500 text-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Konten Utama Halaman (Di-render dari page.jsx) */}
        <div className="p-4 sm:p-6 lg:px-8 flex-1">{children}</div>
      </main>

      {/* 
        =========================================
        BOTTOM NAVIGATION (KHUSUS MOBILE)
        =========================================
      */}
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
                  (isActive("/dashboard/reports") ||
                    isActive("/dashboard/settings")))
                  ? "text-primary"
                  : "text-grey hover:text-primary"
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
