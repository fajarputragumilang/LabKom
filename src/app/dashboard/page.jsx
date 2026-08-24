// Lokasi: /src/app/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import {
  MdEventNote,
  MdAccessTime,
  MdComputer,
  MdInsertDriveFile,
} from "react-icons/md";

export default function DashboardPage() {
  const [userName, setUserName] = useState("Pengguna");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUserName(JSON.parse(userData).username);
    }
  }, []);

  // Data Dummy Statistik untuk Layout (Nanti disambungkan ke backend)
  const stats = [
    //disesuaikan dengan database
    {
      title: "Total Pemesanan",
      value: "128",
      subtext: "+12% bulan ini",
      icon: MdEventNote,
      color: "text-primary",
      bg: "bg-blue-50",
    },
    {
      title: "Lab Tersedia",
      value: "1/2",
      subtext: "Siap digunakan",
      icon: MdAccessTime,
      color: "text-success",
      bg: "bg-green-50",
    },
    {
      title: "Komputer Aktif",
      value: "30",
      subtext: "98% kondisi baik",
      icon: MdComputer,
      color: "text-success",
      bg: "bg-green-50",
    },
    //disesuikan dengan database 
    {
      title: "Pemesanan Hari Ini",
      value: "6",
      subtext: "3 sedang berjalan",
      icon: MdInsertDriveFile,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="w-full font-poppins animate-fade-in">
      {/* Header Halaman */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-1">
          Dashboard Utama
        </h1>
        <p className="text-gray-500 text-sm lg:text-base">
          Selamat Datang <span className="font-semibold">{userName}</span>
        </p>
      </div>

      {/* Grid Statistik Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-2 lg:mb-4">
              <h3 className="text-xs lg:text-sm font-medium text-gray-500">
                {stat.title}
              </h3>
              <div
                className={`p-1.5 lg:p-2 rounded-lg ${stat.bg} ${stat.color}`}
              >
                <stat.icon className="text-lg lg:text-xl" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl lg:text-4xl font-bold text-black-80">
                {stat.value}
              </span>
              <span className={`text-[10px] lg:text-xs mt-1 ${stat.color}`}>
                {stat.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid Tabel Pemesanan & Jadwal Hari Ini (Placeholder Dasar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pemesanan Terbaru (Kiri - Lebar 2 Kolom) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-black-80">
                Pemesanan Terbaru
              </h3>
              <p className="text-xs text-gray-500">
                Daftar transaksi pengajuan lab komputer terkini.
              </p>
            </div>
            <button className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Lihat Semua
            </button>
          </div>
          {/* Nanti di sini kita buatkan Tabel-nya */}
          <div className="h-64 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            Tabel Pemesanan Akan Datang di Sini
          </div>
        </div>

        {/* Jadwal Hari Ini (Kanan - Lebar 1 Kolom) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-bold text-black-80 mb-1">
            Jadwal Hari Ini
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Sesi pengajaran aktif hari ini.
          </p>

          {/* Nanti di sini kita buatkan List Jadwal-nya */}
          <div className="h-64 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm text-center px-4">
            List Jadwal Hari Ini Akan Datang di Sini
          </div>
        </div>
      </div>
    </div>
  );
}
