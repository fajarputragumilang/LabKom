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
    if (!userSession)
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const isUserAdmin =
      ADMIN_USERS.includes(userSession.username) ||
      userSession.role === "ADMIN";
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (body.status && !isUserAdmin) {
      return NextResponse.json(
        { error: "Forbidden. Hanya Admin yang dapat (Accept/Reject)." },
        { status: 403 },
      );
    }

    // REQ #4: Mandatory Reject Reason Validation di Backend
    if (
      body.status === "REJECTED" &&
      (!body.rejectReason || body.rejectReason.trim() === "")
    ) {
      return NextResponse.json(
        { error: "Alasan penolakan (reject reason) wajib disertakan!" },
        { status: 400 },
      );
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id: String(id) },
    });
    if (!existingBooking)
      return NextResponse.json(
        { error: "Pemesanan tidak ditemukan." },
        { status: 404 },
      );

    const updatedBooking = await prisma.booking.update({
      where: { id: String(id) },
      data: {
        ...body,
        // Hapus reason jika status diubah dari Rejected ke status lain (opsional)
        rejectReason:
          body.status === "REJECTED"
            ? body.rejectReason
            : body.status
              ? null
              : existingBooking.rejectReason,
      },
    });

    return NextResponse.json(
      { message: "Data pemesanan berhasil diperbarui.", data: updatedBooking },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
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
