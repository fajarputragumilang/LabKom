// File: src/app/dashboard/booking/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date()); // State realtime untuk Req #6

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    ruangan: "",
    tujuan: "",
    tanggal: "",
    waktuMulai: "",
    waktuSelesai: "",
  });

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

    // Req #6: Interval untuk mengupdate UI status setiap detik/menit
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update tiap 60 detik
    return () => clearInterval(timer);
  }, []);

  const checkIsAdmin = (user) => {
    if (!user) return false;
    return (
      user.username === "asepsukandar" ||
      user.username === "fajarputragumilang" ||
      user.role === "ADMIN"
    );
  };

  // REQ #6: Logika Dynamic Time-Based Status
  const getDynamicStatus = (b) => {
    if (b.status === "REJECTED")
      return {
        text: "REJECTED",
        style: "bg-red-100 text-red-700 border-red-300",
      };
    if (b.status === "PENDING")
      return {
        text: "PENDING",
        style: "bg-yellow-100 text-yellow-700 border-yellow-300",
      };

    // Jika Status = APPROVED, bandingkan dengan waktu real-time
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

  const handleStatusUpdate = async (id, newStatus) => {
    let payload = { status: newStatus };

    // REQ #4: Mandatory Reject Reason Prompt
    if (newStatus === "REJECTED") {
      const reason = prompt("Mohon masukkan alasan penolakan jadwal (Wajib):");
      if (!reason || reason.trim() === "") {
        alert("Aksi dibatalkan. Alasan penolakan wajib diisi!");
        return;
      }
      payload.rejectReason = reason;
    } else {
      if (!confirm("Apakah Anda yakin menyetujui pemesanan ini?")) return;
    }

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

  // REQ #5: Fitur Cancel / Hard Delete
  const handleCancel = async (id) => {
    if (
      !confirm(
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
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            &larr; Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2 tracking-tight">
            Manajemen Booking LabKom
          </h1>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all font-semibold"
        >
          + Buat Booking
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600 font-medium">
            Memuat antrean jadwal...
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-xl rounded-xl border border-gray-100">
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
                const statusBadge = getDynamicStatus(b);
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
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
                      <div className="text-xs text-blue-600 font-bold bg-blue-50 inline-block px-2 py-1 rounded mt-1">
                        ⌚ {b.waktuMulai} - {b.waktuSelesai}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${statusBadge.style}`}
                      >
                        {statusBadge.text}
                      </div>
                      {/* UI Reason Reject Req #4 */}
                      {b.status === "REJECTED" && b.rejectReason && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded text-left whitespace-normal leading-tight border border-red-100 shadow-sm">
                          <strong>Alasan:</strong> {b.rejectReason}
                        </div>
                      )}
                    </td>
                    <td className="p-4 border-b flex justify-center items-center flex-wrap gap-2">
                      {/* ACTION ADMIN: ACCEPT/REJECT */}
                      {userIsAdmin && b.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(b.id, "APPROVED")}
                            className="bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 text-sm shadow font-medium"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(b.id, "REJECTED")}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 text-sm shadow font-medium"
                          >
                            Tolak
                          </button>
                        </>
                      )}

                      {/* ACTION USER/ADMIN: EDIT */}
                      {(userIsAdmin || b.userId === currentUser.id) && (
                        <button
                          onClick={() => openModal(b)}
                          className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-600 hover:text-white text-sm transition font-medium"
                        >
                          Edit
                        </button>
                      )}

                      {/* REQ #5 ACTION USER/ADMIN: CANCEL (DELETE) */}
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
      )}

      {/* Modal Form Edit/Buat */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-fade-in-up">
            <h2 className="text-2xl font-extrabold mb-5 text-gray-900 border-b pb-3">
              {formData.id ? "✏️ Edit Booking" : "📅 Buat Booking Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Ruangan Lab
                </label>
                <select
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
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
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
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
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
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
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
                  className="px-5 py-2.5 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md"
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
