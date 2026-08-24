// Lokasi: /src/app/login/page.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
// useRouter tetap di-import jaga-jaga jika butuh, tapi kita akan pakai window.location.href sesuai logic awalmu
import { useRouter } from "next/navigation";
import { FaUser, FaLock } from "react-icons/fa6";

export default function LoginPage() {
  const router = useRouter();

  // Menggunakan state dari logic awal yang digabung dengan struktur form UI baru
  const [formData, setFormData] = useState({
    username: "", // Diubah dari email ke username menyesuaikan database
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    if (error) setError(""); // Hapus error saat user mulai mengetik lagi
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Tetap reset error saat mencoba login kembali
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Mengirim username dan password persis seperti logic awalmu
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        try {
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (e) {
          console.error("Gagal menyimpan session ke localStorage");
        }

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
    // Pembungkus utama diset ke bg-white untuk memberi warna dasar pada sisi kiri (Desktop)
    <div className="min-h-screen flex w-full font-poppins bg-white">
      {/* 
        =========================================
        KIRI: ILUSTRASI & WELCOME (KHUSUS DESKTOP)
        =========================================
      */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-white relative p-10">
        <div className="w-full max-w-md text-center flex flex-col items-center">
          {/* Menggunakan file desktop.svg */}
          <div className="relative w-[450px] h-[450px] mb-8">
            <Image
              src="/desktop.svg"
              alt="Login Illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* 
        =========================================
        KANAN: FORM LOGIN (FULL MOBILE, 50% DESKTOP)
        =========================================
      */}
      {/* Sisi kanan menggunakan bg-primary secara penuh */}
      <div className="w-full lg:w-1/2 bg-primary flex flex-col justify-center items-center p-8 sm:p-12 md:p-20 relative min-h-screen overflow-hidden">
        <div className="w-full max-w-md flex flex-col items-center z-10">
          {/* Logo Instansi dengan Background Bulat Putih */}
          <div className="mb-6 w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-lg">
            <div className="relative w-full h-full">
              <Image
                src="/LOGODB.png"
                alt="Logo SMKS Doa Bangsa"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Garis Ornamen Putih (Sesuai Desain) */}
          <div className="w-full mb-8 flex flex-col items-center gap-2 text-white text-center">
            <h2 className="text-xl font-semibold md:text-2xl">
              Sistem Pemesanan Lab Komputer
            </h2>
            <h3 className="text-xl font-semibold md:text-2xl">
              SMKS DOA BANGSA
            </h3>
          </div>

          {/* Form Login */}
          <form
            onSubmit={handleLogin}
            className="w-full space-y-6 flex flex-col items-center"
          >
            {/* Notifikasi Error UI */}
            {error && (
              <div className="w-full mb-2 p-3 bg-red-500/20 text-white border border-red-500/50 rounded-lg text-sm text-center font-medium">
                {error}
              </div>
            )}

            {/* Input Username */}
            <div className="flex flex-col space-y-2 w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-white text-lg" />
                </div>
                <input
                  type="text" // Diubah menjadi text karena ini username
                  name="username" // Name disesuaikan menjadi username
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent border-2 border-white rounded-md text-white placeholder-white focus:outline-none focus:ring-0 transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="flex flex-col space-y-2 w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-white text-lg" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent border-2 border-white rounded-md text-white placeholder-white focus:outline-none focus:ring-0 transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-1/2 py-3.5 mt-4 bg-white text-primary font-bold text-lg rounded-md shadow-lg hover:bg-gray-100 hover:scale-[1.02] focus:outline-none transition-all flex justify-center items-center disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              ) : (
                "LOGIN"
              )}
            </button>
          </form>
        </div>

        {/* Ornamen Kotak Bawah */}
        <div className="absolute bottom-8 w-full px-12 hidden lg:flex justify-between items-center z-0">
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-white rounded-sm"></div>
            <div className="w-8 h-8 bg-white rounded-sm"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-white rounded-sm"></div>
            <div className="w-8 h-8 bg-white rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
