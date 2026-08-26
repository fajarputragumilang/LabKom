// Lokasi: /src/app/dashboard/booking/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // State Form Edit/Create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    ruangan: "",
    tujuan: "",
    tanggal: "",
    waktuMulai: "",
    waktuSelesai: "",
  });

  // State untuk Modal Reject
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    bookingId: "",
  });
  const [rejectReason, setRejectReason] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/booking");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal load data", error);
    } finally {
      setLoading(false);
    }
  };

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

    if (sessionData) setCurrentUser(JSON.parse(sessionData));

    fetchBookings();
  }, []);

  const checkIsAdmin = (user) => {
    if (!user) return false;
    return (
      user.username === "asepsukandar" ||
      user.username === "fajarputragumilang" ||
      user.role === "ADMIN"
    );
  };

  // --- LOGIC UI STATUS YANG DISIMPLIFIKASI ---
  // Hanya menampilkan Pending, Accepted, dan Rejected di halaman Pemesanan
  const getDisplayStatus = (status) => {
    switch (status) {
      case "REJECTED":
        return {
          text: "REJECTED",
          style: "bg-red-100 text-red-700 border-red-300",
        };
      case "PENDING":
        return {
          text: "PENDING",
          style: "bg-yellow-100 text-yellow-700 border-yellow-300",
        };
      case "APPROVED":
        return {
          text: "ACCEPTED",
          style: "bg-green-100 text-green-800 border-green-400 shadow-sm",
        };
      default:
        return {
          text: status,
          style: "bg-gray-100 text-gray-700 border-gray-300",
        };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = formData.id ? `/api/booking/${formData.id}` : "/api/booking";
    const method = formData.id ? "PUT" : "POST";
    const payload = { ...formData, userId: currentUser.id };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok) {
      alert(result.message || "Data berhasil disimpan");
      setIsModalOpen(false);
      fetchBookings();
    } else {
      alert(result.error || "Terjadi kesalahan");
    }
  };

  const executeStatusUpdate = async (id, newStatus, reason = null) => {
    let payload = { status: newStatus };
    if (reason) payload.rejectReason = reason;

    try {
      const res = await fetch(`/api/booking/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        alert(`Pemesanan berhasil di-${newStatus}`);
        fetchBookings();
      } else {
        alert(result.error || "Gagal mengubah status");
      }
    } catch (error) {
      alert("Terjadi kesalahan pada sistem.");
    }
  };

  const handleStatusUpdate = (id, newStatus) => {
    if (newStatus === "REJECTED") {
      setRejectModal({ isOpen: true, bookingId: id });
      setRejectReason("");
      return;
    } else {
      if (!window.confirm("Apakah Anda yakin menyetujui pemesanan ini?"))
        return;
      executeStatusUpdate(id, newStatus);
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectReason || rejectReason.trim() === "") {
      alert("Alasan penolakan wajib diisi!");
      return;
    }
    executeStatusUpdate(rejectModal.bookingId, "REJECTED", rejectReason);
    setRejectModal({ isOpen: false, bookingId: "" });
  };

  const handleCancel = async (id) => {
    if (
      !window.confirm(
        "⚠️ PERINGATAN: Apakah Anda yakin ingin membatalkan dan MENGHAPUS pesanan ini secara permanen?",
      )
    )
      return;

    try {
      const res = await fetch(`/api/booking/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        fetchBookings();
      } else {
        alert(result.error || "Gagal membatalkan pemesanan");
      }
    } catch (error) {
      alert("Terjadi kesalahan pada sistem.");
    }
  };

  const openModal = (b = null) => {
    if (b) {
      setFormData({
        id: b.id,
        ruangan: b.ruangan,
        tujuan: b.tujuan,
        tanggal: new Date(b.tanggal).toISOString().split("T")[0],
        waktuMulai: b.waktuMulai,
        waktuSelesai: b.waktuSelesai,
      });
    } else {
      setFormData({
        id: "",
        ruangan: "",
        tujuan: "",
        tanggal: "",
        waktuMulai: "",
        waktuSelesai: "",
      });
    }
    setIsModalOpen(true);
  };

  if (!currentUser)
    return (
      <div className="p-10 text-center font-bold text-gray-600">
        Verifikasi sesi...
      </div>
    );

  const userIsAdmin = checkIsAdmin(currentUser);

  return (
    <div className="p-2 md:p-6 bg-gray-50 min-h-screen font-poppins animate-fade-in">
      {/* HEADER PAGE */}
      <div className="flex justify-between items-center mb-4 md:mb-6 mt-2 md:mt-0 gap-2">
        <h1 className="text-xl md:text-3xl font-extrabold text-primary tracking-tight leading-tight">
          Manajemen Booking
        </h1>
        <button
          onClick={() => openModal()}
          className="bg-primary text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition-all font-semibold text-xs md:text-base shrink-0"
        >
          + Buat Booking
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-3 text-gray-600 font-medium">
            Memuat antrean jadwal...
          </p>
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* 1. TAMPILAN MOBILE: KARTU LIST TANPA SCROLL HORIZONTAL   */}
          {/* ======================================================== */}
          <div className="md:hidden flex flex-col gap-3 pb-6">
            {bookings.length === 0 ? (
              <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-lg font-semibold text-gray-400">
                  Belum ada pemesanan
                </div>
              </div>
            ) : (
              bookings.map((b) => {
                const statusBadge = getDisplayStatus(b.status);
                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-3.5 flex flex-col gap-3"
                  >
                    {/* Header: User & Status */}
                    <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          {b.user?.nama || b.user?.username || "Guru"}
                        </h3>
                        <p className="text-[10px] text-gray-500">
                          {b.user?.role || "USER"}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge.style}`}
                      >
                        {statusBadge.text === "ACCEPTED" && (
                          <span className="mr-1">✔️</span>
                        )}
                        {statusBadge.text}
                      </div>
                    </div>

                    {/* Content: Ruang & Tujuan */}  
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Ruangan</span>
                        <span className="text-xs font-semibold text-gray-800">
                          {b.ruangan}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-gray-500 whitespace-nowrap mr-4">
                          Tujuan
                        </span>
                        <span className="text-xs font-medium text-gray-700 text-right line-clamp-2">
                          {b.tujuan}
                        </span>
                      </div>
                    </div>

                    {/* Reject Reason if any */}
                    {b.status === "REJECTED" && b.rejectReason && (
                      <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded border border-red-100">
                        <strong>Alasan Penolakan:</strong> {b.rejectReason}
                      </div>
                    )}

                    {/* Waktu Pelaksanaan */}
                    <div className="bg-blue-50/50 p-2.5 rounded-lg flex justify-between items-center border border-blue-100/50 mt-1">
                      <div className="text-[11px] font-medium text-gray-600">
                        {new Date(b.tanggal).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[11px] font-bold text-primary">
                        ⌚ {b.waktuMulai} - {b.waktuSelesai}
                      </div>
                    </div>

                    {/* Aksi / Tombol Khusus Mobile */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {userIsAdmin && b.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(b.id, "APPROVED")}
                            className="flex-1 bg-green-500 text-white py-1.5 rounded-md text-xs font-semibold shadow-sm"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(b.id, "REJECTED")}
                            className="flex-1 bg-red-500 text-white py-1.5 rounded-md text-xs font-semibold shadow-sm"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                      {(userIsAdmin || b.userId === currentUser.id) && (
                        <button
                          onClick={() => openModal(b)}
                          className="flex-1 bg-blue-50 text-primary border border-blue-200 py-1.5 rounded-md text-xs font-semibold"
                        >
                          Edit
                        </button>
                      )}
                      {(userIsAdmin || b.userId === currentUser.id) && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="flex-1 bg-gray-100 text-gray-700 border border-gray-300 py-1.5 rounded-md text-xs font-semibold"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ======================================================== */}
          {/* 2. TAMPILAN DESKTOP: TABEL STANDAR                       */}
          {/* ======================================================== */}
          <div className="hidden md:block overflow-x-auto bg-white shadow-sm rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-800 text-gray-100 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold rounded-tl-xl">Pengguna</th>
                  <th className="p-4 font-semibold">Ruangan</th>
                  <th className="p-4 font-semibold">Tujuan</th>
                  <th className="p-4 font-semibold">Waktu Pelaksanaan</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-center rounded-tr-xl">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => {
                  const statusBadge = getDisplayStatus(b.status);
                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-gray-900">
                          {b.user?.nama || b.user?.username || "Guru"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {b.user?.role || "USER"}
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 font-medium">
                        {b.ruangan}
                      </td>
                      <td
                        className="p-4 text-gray-600 truncate max-w-[200px]"
                        title={b.tujuan}
                      >
                        {b.tujuan}
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {new Date(b.tanggal).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-primary font-bold bg-blue-50 inline-block px-2 py-1 rounded mt-1">
                          ⌚ {b.waktuMulai} - {b.waktuSelesai}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.style} uppercase tracking-wide`}
                          >
                            {statusBadge.text === "ACCEPTED" && (
                              <span className="mr-1.5">✔️</span>
                            )}
                            {statusBadge.text}
                          </div>
                          {b.status === "REJECTED" && b.rejectReason && (
                            <div className="mt-1 text-[11px] text-red-600 bg-red-50 p-2 rounded text-left whitespace-normal leading-tight border border-red-100 shadow-sm w-full max-w-[150px]">
                              <strong>Alasan:</strong> {b.rejectReason}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 border-b flex justify-center items-center flex-wrap gap-2">
                        {userIsAdmin && b.status === "PENDING" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(b.id, "APPROVED")
                              }
                              className="bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 text-sm shadow font-medium"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(b.id, "REJECTED")
                              }
                              className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 text-sm shadow font-medium"
                            >
                              Tolak
                            </button>
                          </>
                        )}
                        {(userIsAdmin || b.userId === currentUser.id) && (
                          <button
                            onClick={() => openModal(b)}
                            className="bg-blue-50 text-primary border border-blue-200 px-3 py-1.5 rounded-md hover:bg-primary hover:text-white text-sm transition font-medium"
                          >
                            Edit
                          </button>
                        )}
                        {(userIsAdmin || b.userId === currentUser.id) && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-red-600 hover:text-white hover:border-red-600 text-sm transition font-medium"
                          >
                            Batalkan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {bookings.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center p-8 text-gray-500 bg-gray-50"
                    >
                      <div className="text-lg font-semibold text-gray-400">
                        Tabel Kosong
                      </div>
                      <div className="text-sm">
                        Belum ada antrean pemesanan lab yang masuk ke sistem.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- MODAL INPUT REJECT REASON --- */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-fade-in-up">
            <h2 className="text-xl font-extrabold mb-4 text-red-600 border-b pb-3">
              ❌ Alasan Penolakan
            </h2>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Mohon masukkan alasan penolakan jadwal (Wajib):
                </label>
                <textarea
                  required
                  rows="3"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 outline-none"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Lab sedang dalam perbaikan jaringan..."
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() =>
                    setRejectModal({ isOpen: false, bookingId: "" })
                  }
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-md"
                >
                  Tolak Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Form Edit/Buat */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-extrabold mb-5 text-gray-900 border-b pb-3">
              {formData.id ? "✏️ Edit Booking" : "📅 Buat Booking Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Ruangan Lab
                </label>
                <select
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 outline-none"
                  value={formData.ruangan}
                  onChange={(e) =>
                    setFormData({ ...formData, ruangan: e.target.value })
                  }
                >
                  <option value="">-- Pilih Lab Komputer --</option>
                  <option value="Lab Komputer 1">Lab Komputer 1</option>
                  <option value="Lab Komputer 2">Lab Komputer 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Tujuan / Kegiatan
                </label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 outline-none"
                  value={formData.tujuan}
                  onChange={(e) =>
                    setFormData({ ...formData, tujuan: e.target.value })
                  }
                  placeholder="Contoh: Praktikum Basis Data"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  required
                  type="date"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 outline-none"
                  value={formData.tanggal}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal: e.target.value })
                  }
                />
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    required
                    type="time"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50"
                    value={formData.waktuMulai}
                    onChange={(e) =>
                      setFormData({ ...formData, waktuMulai: e.target.value })
                    }
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    required
                    type="time"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50"
                    value={formData.waktuSelesai}
                    onChange={(e) =>
                      setFormData({ ...formData, waktuSelesai: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8 pt-5 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
