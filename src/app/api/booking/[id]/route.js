import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const checkIsAdmin = (username, role) => {
  return (
    username === "asepsukandar" ||
    username === "fajarputragumilang" ||
    role === "ADMIN"
  );
};

export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { currentUser, ruangan, tujuan, tanggal, waktuMulai, waktuSelesai } =
      body;

    const existingBooking = await prisma.booking.findUnique({ where: { id } });
    if (!existingBooking)
      return NextResponse.json(
        { error: "Booking tidak ditemukan" },
        { status: 404 },
      );

    const userIsAdmin = checkIsAdmin(currentUser?.username, currentUser?.role);
    if (!userIsAdmin && existingBooking.userId !== currentUser?.id) {
      return NextResponse.json(
        { error: "Tidak memiliki izin mengedit booking ini" },
        { status: 403 },
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        ruangan,
        tujuan,
        tanggal: new Date(tanggal),
        waktuMulai,
        waktuSelesai,
      },
    });

    return NextResponse.json(
      { message: "Booking berhasil diupdate", data: updatedBooking },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal update booking" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    const reqUserId = request.headers.get("x-user-id");
    const reqUsername = request.headers.get("x-username");
    const reqRole = request.headers.get("x-user-role");

    const existingBooking = await prisma.booking.findUnique({ where: { id } });
    if (!existingBooking)
      return NextResponse.json(
        { error: "Booking tidak ditemukan" },
        { status: 404 },
      );

    const userIsAdmin = checkIsAdmin(reqUsername, reqRole);
    if (!userIsAdmin && existingBooking.userId !== reqUserId) {
      return NextResponse.json(
        { error: "Tidak memiliki izin menghapus booking ini" },
        { status: 403 },
      );
    }

    await prisma.booking.delete({ where: { id } });
    return NextResponse.json(
      { message: "Booking berhasil dihapus/ditolak dari database" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus booking" },
      { status: 500 },
    );
  }
}
