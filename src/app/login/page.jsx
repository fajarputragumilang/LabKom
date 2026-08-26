// Lokasi: /src/app/login/page.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaUser, FaLock, FaSquareInstagram, FaYoutube, FaGlobe } from "react-icons/fa6";
import { FaFacebookSquare } from "react-icons/fa";

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
    <div className="min-h-screen flex w-full font-poppins bg-white">
      {/* 
        =========================================
        KIRI: ILUSTRASI & WELCOME (KHUSUS DESKTOP)
        =========================================
      */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-white relative">
        <div className="w-full max-w-md text-center flex flex-col items-center">
          {/* Menggunakan file desktop.svg */}
          <div className="relative w-[42rem] h-[42rem] md:w-[38rem] md:h-[38rem]">
            <Image
              src="/desktop.svg"
              alt="Login Illustration"
              fill
              className=""
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
          <div className="mb-6 w-28 h-28 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-lg ">
            <div className="relative w-28 h-28 md:w-32 md:h-32 lg:w-full lg:h-full">
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
            <h2 className="text-16 font-semibold md:text-2xl">
              Sistem Pemesanan Lab Komputer
            </h2>
            <h3 className="text-14 font-semibold md:text-xl">
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
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent border-1 border-white rounded-md text-white placeholder-slate-300   focus:outline-none focus:ring-0 transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="flex flex-col space-y-2 w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-white text-lg"/>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent border-1 border-white rounded-md text-white placeholder-slate-300 focus:outline-none focus:ring-0 transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-32 py-2 mt-2 opacity-100 md:opacity-85 hover:opacity-100 bg-white text-primary font-bold text-lg rounded-md shadow-lg hover:scale-[1.05] focus:outline-none transition-all flex justify-center items-center disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed hover:cursor-pointer"
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
        <div className="absolute bottom-8 w-full flex md:px-12 lg:flex justify-between items-center z-0 px-8">
          <div className="flex gap-4">
            <FaSquareInstagram className="w-8 h-8 md:opacity-85 md:hover:opacity-100 text-white cursor-pointer opacity-100" />
            <FaFacebookSquare className="w-8 h-8 md:opacity-85 hover:opacity-100 text-white md:hover:cursor-pointer opacity-100" />
          </div>
          <div className="flex gap-4">
            <FaYoutube className="w-8 h-8 md:opacity-85 md:hover:opacity-100 text-white cursor-pointer opacity-100" />
            <FaGlobe className="w-7 h-7 md:opacity-85 md:hover:opacity-100 text-white cursor-pointer opacity-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
