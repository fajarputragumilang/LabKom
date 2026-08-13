import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

const ADMIN_USERS = ["fajarputragumilang", "asepsukandar"];

export async function PATCH(request, { params }) {
  try {
    // 1. Ekstrak dan Parse Cookie 'session_user'
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session_user")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized. Sesi tidak ditemukan. Harap login kembali." },
        { status: 401 },
      );
    }

    const userData = JSON.parse(sessionCookie);

    // 2. Validasi Otorisasi Admin
    if (!userData.username || !ADMIN_USERS.includes(userData.username)) {
      return NextResponse.json(
        { error: "Forbidden. Hanya Admin yang dapat memvalidasi pemesanan." },
        { status: 403 },
      );
    }

    // 3. Ekstrak parameter id dan body request
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Bad Request. Status persetujuan wajib dikirim." },
        { status: 400 },
      );
    }

    // 4. Update data menggunakan Prisma
    const updatedBooking = await prisma.booking.update({
      where: { id: String(id) },
      data: { status },
    });

    return NextResponse.json(
      {
        message: "Status pemesanan berhasil diperbarui.",
        data: updatedBooking,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("ERROR PATCH /api/booking/[id]/approve:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server", details: error.message },
      { status: 500 },
    );
  }
}
