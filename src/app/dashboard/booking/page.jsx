"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    ruangan: "",
    tujuan: "",
    tanggal: "",
    waktuMulai: "",
    waktuSelesai: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setCurrentUser(user);
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

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/booking");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal load data", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = formData.id ? `/api/booking/${formData.id}` : "/api/booking";
    const method = formData.id ? "PUT" : "POST";

    const payload = {
      ...formData,
      userId: currentUser.id,
      currentUser,
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok) {
      alert(result.message);
      setIsModalOpen(false);
      fetchBookings();
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus/menolak pemesanan ini?"))
      return;

    const res = await fetch(`/api/booking/${id}`, {
      method: "DELETE",
      headers: {
        "x-user-id": currentUser.id,
        "x-username": currentUser.username,
        "x-user-role": currentUser.role || "",
      },
    });

    if (res.ok) {
      alert("Data booking berhasil dibersihkan dari database.");
      fetchBookings();
    } else {
      const result = await res.json();
      alert(result.error);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm("Setujui peminjaman lab ini?")) return;

    const res = await fetch(`/api/booking/${id}/approve`, {
      method: "PATCH",
      headers: {
        "x-username": currentUser.username,
        "x-user-role": currentUser.role || "",
      },
    });

    if (res.ok) {
      alert("Booking disetujui (APPROVED)!");
      fetchBookings();
    } else {
      const result = await res.json();
      alert(result.error);
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">
            Manajemen Booking LabKom
          </h1>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          + Booking Lab
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat antrean jadwal...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-4 border-b font-medium">Guru</th>
                <th className="p-4 border-b font-medium">Tujuan</th>
                <th className="p-4 border-b font-medium">Lab</th>
                <th className="p-4 border-b font-medium">Waktu</th>
                <th className="p-4 border-b font-medium">Status</th>
                <th className="p-4 border-b font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 border-b font-semibold text-gray-800">
                    {b.user?.nama || b.user?.username || "Guru"}
                  </td>
                  <td className="p-4 border-b text-gray-600">{b.tujuan}</td>
                  <td className="p-4 border-b text-gray-600">{b.ruangan}</td>
                  <td className="p-4 border-b text-sm text-gray-600">
                    {new Date(b.tanggal).toLocaleDateString("id-ID")} <br />
                    <span className="font-semibold">
                      {b.waktuMulai} - {b.waktuSelesai}
                    </span>
                  </td>
                  <td className="p-4 border-b">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 border-b flex justify-center flex-wrap gap-2">
                    {userIsAdmin && b.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleApprove(b.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm shadow"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm shadow"
                        >
                          Tolak
                        </button>
                      </>
                    )}

                    {(userIsAdmin || b.userId === currentUser.id) && (
                      <>
                        <button
                          onClick={() => openModal(b)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm shadow"
                        >
                          Edit
                        </button>
                        {(userIsAdmin || b.status === "PENDING") && (
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm shadow"
                          >
                            Hapus
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-500">
                    Belum ada antrean pemesanan lab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              {formData.id ? "Edit Booking" : "Buat Booking Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Ruangan Lab
                </label>
                <select
                  required
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mata Pelajaran / Tujuan
                </label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.tujuan}
                  onChange={(e) =>
                    setFormData({ ...formData, tujuan: e.target.value })
                  }
                  placeholder="Contoh: Praktikum Jaringan"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tanggal Penggunaan
                </label>
                <input
                  required
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.tanggal}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal: e.target.value })
                  }
                />
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    required
                    type="time"
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                    value={formData.waktuMulai}
                    onChange={(e) =>
                      setFormData({ ...formData, waktuMulai: e.target.value })
                    }
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    required
                    type="time"
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                    value={formData.waktuSelesai}
                    onChange={(e) =>
                      setFormData({ ...formData, waktuSelesai: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded hover:bg-gray-300 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
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
