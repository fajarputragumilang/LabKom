import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

const ADMIN_USERS = ["fajarputragumilang", "asepsukandar"];

// Fungsi Helper untuk mendapatkan sesi user dari JSON Cookie
async function getUserSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_user")?.value;

  if (!sessionCookie) return null;

  try {
    return JSON.parse(sessionCookie);
  } catch (error) {
    console.error("Gagal melakukan parse cookie:", error);
    return null;
  }
}

// METHOD PUT: Digunakan untuk EDIT DATA, ACCEPT, dan REJECT
export async function PUT(request, { params }) {
  try {
    const userSession = await getUserSession();

    if (!userSession) {
      return NextResponse.json(
        { error: "Unauthorized. Harap login terlebih dahulu." },
        { status: 401 },
      );
    }

    const isUserAdmin = ADMIN_USERS.includes(userSession.username);
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    // Validasi 1: Jika request mengandung perubahan 'status' (Accept/Reject), HANYA ADMIN yang boleh
    if (body.status && !isUserAdmin) {
      return NextResponse.json(
        {
          error:
            "Forbidden. Hanya Admin yang dapat memberikan keputusan (Accept/Reject).",
        },
        { status: 403 },
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

    // Eksekusi Update ke Database
    const updatedBooking = await prisma.booking.update({
      where: { id: String(id) },
      data: { ...body },
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

// METHOD DELETE: Dinonaktifkan sementara sesuai kebutuhan Fase 3
export async function DELETE(request, { params }) {
  return NextResponse.json(
    { error: "Fitur hapus dinonaktifkan pada fase ini." },
    { status: 400 },
  );
}
