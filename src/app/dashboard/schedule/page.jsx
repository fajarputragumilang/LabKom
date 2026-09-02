// Lokasi: /src/app/dashboard/schedule/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdCalendarToday,
  MdAccessTime,
  MdPerson,
  MdRoom,
} from "react-icons/md";

export default function SchedulePage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Fetch Data dari API dan jalankan Timer Real-Time
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/booking");
        const data = await res.json();
        // Hanya ambil yang sudah di-APPROVE oleh Admin
        const approvedBookings = Array.isArray(data)
          ? data.filter((b) => b.status === "APPROVED")
          : [];
        setBookings(approvedBookings);
      } catch (error) {
        console.error("Gagal load data jadwal", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    // Menjalankan timer untuk update waktu nyata setiap 1 menit (60000ms)
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 2. Logic Status Dinamis Berdasarkan Waktu Nyata (Diadaptasi dari kode awalmu)
  const getDynamicStatus = (b) => {
    const bookingDate = new Date(b.tanggal);
    const [startH, startM] = b.waktuMulai.split(":").map(Number);
    const [endH, endM] = b.waktuSelesai.split(":").map(Number);

    const startDateTime = new Date(bookingDate).setHours(startH, startM, 0, 0);
    const endDateTime = new Date(bookingDate).setHours(endH, endM, 0, 0);
    const now = currentTime.getTime();

    if (now < startDateTime) {
      return {
        text: "UPCOMING",
        style: "bg-gray-200 text-gray-700 border-gray-400",
      };
    } else if (now >= startDateTime && now <= endDateTime) {
      return {
        text: "ONGOING",
        style:
          "bg-orange-100 text-orange-700 border-orange-400 animate-pulse ring-2 ring-orange-500 shadow-lg",
      };
    } else {
      return {
        text: "COMPLETED",
        style: "bg-green-100 text-green-700 border-green-400",
      };
    }
  };

  // 3. Logic Perhitungan Minggu (Senin - Minggu)
  const { startOfWeek, endOfWeek, currentWeekBookings } = useMemo(() => {
    const now = new Date();
    const day = now.getDay() || 7;

    const start = new Date(now);
    start.setDate(now.getDate() - day + 1 + weekOffset * 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const filtered = bookings.filter((b) => {
      const bDate = new Date(b.tanggal);
      return bDate >= start && bDate <= end;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(`${a.tanggal}T${a.waktuMulai}`);
      const dateB = new Date(`${b.tanggal}T${b.waktuMulai}`);
      return dateA - dateB;
    });

    return {
      startOfWeek: start,
      endOfWeek: end,
      currentWeekBookings: filtered,
    };
  }, [bookings, weekOffset]);

  // 4. Mengelompokkan Jadwal berdasarkan Tanggal
  const groupedBookings = useMemo(() => {
    return currentWeekBookings.reduce((acc, booking) => {
      const dateStr = booking.tanggal;
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(booking);
      return acc;
    }, {});
  }, [currentWeekBookings]);

  // Format Tanggal
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDayDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="w-full font-poppins px-2 py-3 md:p-6 lg:p-8 animate-fade-in min-h-[80vh]">
      <div className="mb-4 md:mb-8 text-center">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary mb-1">
          Jadwal Lab Komputer
        </h1>
        <p className="text-gray-500 text-xs md:text-sm">
          Pantau jadwal penggunaan laboratorium yang telah disetujui.
        </p>
      </div>

      <div className="flex items-center justify-between bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 mb-6 mx-8 md:w-full md:mx-0 ">
        <button
          onClick={() => setWeekOffset((prev) => prev - 1)}
          className="p-2 bg-gray-300  text-gray-700 rounded-full transition-colors"
        >
          <MdChevronLeft className="text-xl md:text-2xl" />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-primary font-bold text-sm md:text-base">
            <MdCalendarToday />
            <span>
              {formatDate(startOfWeek)}{" "}
              <span className="text-gray-400 font-normal mx-1">-</span>{" "}
              {formatDate(endOfWeek)}
            </span>
          </div>
          {weekOffset === 0 && (
            <span className="text-[10px] md:text-xs text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded-full mt-1">
              Minggu Ini
            </span> 
          )}
        </div>

        <button
          onClick={() => setWeekOffset((prev) => prev + 1)}
          className="p-2 bg-gray-300 text-gray-700 rounded-full transition-colors"
        >
          <MdChevronRight className="text-xl md:text-2xl" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-40 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-gray-500 text-sm">Menyusun jadwal...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 md:gap-8 pb-8">
          {Object.keys(groupedBookings).length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <MdCalendarToday className="text-2xl" />
              </div>
              <h3 className="text-gray-800 font-bold mb-1">Jadwal Kosong</h3>
              <p className="text-gray-500 text-xs md:text-sm max-w-sm">
                Tidak ada penggunaan lab yang dijadwalkan pada minggu ini.
              </p>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="mt-4 text-primary text-sm font-semibold hover:underline"
                >
                  Kembali ke Minggu Ini
                </button>
              )}
            </div>
          ) : (
            Object.keys(groupedBookings).map((date) => (
              <div key={date} className="flex flex-col gap-3">
                <div className="sticky top-16 lg:top-0 bg-[#F8F9FA]/90 backdrop-blur-sm z-10 py-2 border-b border-gray-200/50">
                  <h2 className="text-sm md:text-base font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-warning"></div>
                    {formatDayDate(date)}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {groupedBookings[date].map((b) => {
                    // Panggil fungsi status untuk setiap jadwal
                    const statusBadge = getDynamicStatus(b);

                    return (
                      <div
                        key={b.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-primary/30 group"
                      >
                        <div className="bg-gray-50/50 border-b border-gray-100 p-3 flex justify-between items-center">
                          <div className="flex items-center gap-1.5 text-primary font-bold text-xs md:text-sm">
                            <MdRoom className="text-base" />
                            <span>{b.ruangan}</span>
                          </div>

                          {/* Implementasi Badge Status Nyata di sini */}
                          <div className="flex items-center gap-2">
                            <div
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge.style}`}
                            >
                              {statusBadge.text}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 md:p-4 flex flex-col gap-2 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                              <MdPerson className="text-lg" />
                            </div>
                            <div className="flex flex-col w-full">
                              <div className="flex justify-between items-center w-full">
                                <span className="text-[10px] text-gray-500 font-medium">
                                  Pengajar / Pemesan
                                </span>
                                <div className="flex items-center gap-1 text-gray-600 text-[10px] font-semibold bg-gray-100 px-1.5 py-0.5 rounded">
                                  <MdAccessTime />
                                  <span>
                                    {b.waktuMulai} - {b.waktuSelesai}
                                  </span>
                                </div>
                              </div>
                              <span className="text-sm md:text-base font-bold text-gray-900 leading-tight">
                                {b.user?.nama || b.user?.username || "Guru"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-1 ml-10">
                            <span className="text-[10px] text-gray-500 font-medium block mb-0.5">
                              Kegiatan:
                            </span>
                            <p className="text-xs text-gray-700 font-medium bg-gray-50 p-2 rounded border border-gray-100">
                              {b.tujuan}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
