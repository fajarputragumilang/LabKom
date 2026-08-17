// File: src/app/api/booking/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

const ADMIN_USERS = ["fajarputragumilang", "asepsukandar"];

async function getUserSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_user")?.value;
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie);
  } catch (error) {
    return null;
  }
}

// METHOD PUT: EDIT, ACCEPT, & REJECT
export async function PUT(request, { params }) {
  try {
    const userSession = await getUserSession();

    if (!userSession) {
      return NextResponse.json(
        { error: "Unauthorized. Harap login terlebih dahulu." },
        { status: 401 },
      );
    }

    const isUserAdmin =
      ADMIN_USERS.includes(userSession.username) ||
      userSession.role === "ADMIN";
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    // Validasi Accept/Reject (Hanya Admin)
    if (body.status && !isUserAdmin) {
      return NextResponse.json(
        { error: "Forbidden. Hanya Admin yang dapat memberikan keputusan." },
        { status: 403 },
      );
    }

    // Validasi Mandatory Reject Reason
    if (
      body.status === "REJECTED" &&
      (!body.rejectReason || body.rejectReason.trim() === "")
    ) {
      return NextResponse.json(
        { error: "Alasan penolakan (reject reason) wajib disertakan!" },
        { status: 400 },
      );
    }

    // Cek eksistensi data
    const existingBooking = await prisma.booking.findUnique({
      where: { id: String(id) },
    });
    if (!existingBooking) {
      return NextResponse.json(
        { error: "Pemesanan tidak ditemukan." },
        { status: 404 },
      );
    }

    // PERBAIKAN BUG EDIT: Susun payload data yang aman & konversi tanggal ke ISO Date
    let updateData = {};
    if (body.ruangan) updateData.ruangan = body.ruangan;
    if (body.tujuan) updateData.tujuan = body.tujuan;
    if (body.tanggal) updateData.tanggal = new Date(body.tanggal); // Format ulang ke Date()
    if (body.waktuMulai) updateData.waktuMulai = body.waktuMulai;
    if (body.waktuSelesai) updateData.waktuSelesai = body.waktuSelesai;
    if (body.status) updateData.status = body.status;

    // Logic penanganan Reason
    if (body.status === "REJECTED") {
      updateData.rejectReason = body.rejectReason;
    } else if (body.status === "APPROVED" || body.status === "PENDING") {
      updateData.rejectReason = null; // Hapus reason jika status berubah selain rejected
    }

    // Eksekusi Update ke Database
    const updatedBooking = await prisma.booking.update({
      where: { id: String(id) },
      data: updateData, // Gunakan updateData yang sudah di-filter
    });

    return NextResponse.json(
      { message: "Data pemesanan berhasil diperbarui.", data: updatedBooking },
      { status: 200 },
    );
  } catch (error) {
    console.error("ERROR PUT /api/booking/[id]:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server", details: error.message },
      { status: 500 },
    );
  }
}

// METHOD DELETE: REQ #5 CANCEL BOOKING / HARD DELETE
export async function DELETE(request, { params }) {
  try {
    const userSession = await getUserSession();
    if (!userSession)
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const existingBooking = await prisma.booking.findUnique({
      where: { id: String(id) },
    });
    if (!existingBooking)
      return NextResponse.json(
        { error: "Pemesanan tidak ditemukan." },
        { status: 404 },
      );

    const isUserAdmin =
      ADMIN_USERS.includes(userSession.username) ||
      userSession.role === "ADMIN";

    // Hanya Admin atau Pemilik data yang boleh menghapus (Cancel)
    if (!isUserAdmin && existingBooking.userId !== userSession.id) {
      return NextResponse.json(
        { error: "Forbidden. Anda tidak berhak membatalkan pesanan ini." },
        { status: 403 },
      );
    }

    await prisma.booking.delete({
      where: { id: String(id) },
    });

    return NextResponse.json(
      { message: "Pemesanan berhasil dibatalkan (Data dihapus permanen)." },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus data" },
      { status: 500 },
    );
  }
}
