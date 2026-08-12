import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { username: true, nama: true, role: true } },
      },
      orderBy: { tanggal: "desc" },
    });
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data booking" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, ruangan, tujuan, tanggal, waktuMulai, waktuSelesai } = body;

    if (
      !userId ||
      !ruangan ||
      !tujuan ||
      !tanggal ||
      !waktuMulai ||
      !waktuSelesai
    ) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 },
      );
    }

    const checkConflict = await prisma.booking.findFirst({
      where: {
        ruangan,
        tanggal: new Date(tanggal),
        status: "APPROVED",
        OR: [
          {
            waktuMulai: { lte: waktuSelesai },
            waktuSelesai: { gte: waktuMulai },
          },
        ],
      },
    });

    if (checkConflict) {
      return NextResponse.json(
        { error: "Jadwal bentrok dengan booking yang sudah disetujui" },
        { status: 400 },
      );
    }

    const newBooking = await prisma.booking.create({
      data: {
        userId,
        ruangan,
        tujuan,
        tanggal: new Date(tanggal),
        waktuMulai,
        waktuSelesai,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        message: "Booking berhasil dibuat (Menunggu Persetujuan Admin)",
        data: newBooking,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat booking" },
      { status: 500 },
    );
  }
}
