// File: src/app/api/booking/route.js
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

    // --- REQ #3: Validasi Waktu Lampau & Batas Tahun 2026 ---
    const now = new Date();
    const bookingDate = new Date(tanggal);
    const bookingYear = bookingDate.getFullYear();

    if (bookingYear > 2026) {
      return NextResponse.json(
        { error: "Booking tidak diizinkan untuk tahun setelah 2026." },
        { status: 400 },
      );
    }

    const [startHour, startMinute] = waktuMulai.split(":").map(Number);
    const bookingStartDateTime = new Date(bookingDate);
    bookingStartDateTime.setHours(startHour, startMinute, 0, 0);

    if (bookingStartDateTime < now) {
      return NextResponse.json(
        {
          error:
            "Tidak dapat melakukan booking untuk tanggal atau jam yang sudah berlalu.",
        },
        { status: 400 },
      );
    }
    // ---------------------------------------------------------

    // Pembuatan range waktu hari H untuk query database (00:00 - 23:59)
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // --- REQ #1: Limitasi 1 Booking / User / Hari ---
    const existingUserBooking = await prisma.booking.findFirst({
      where: {
        userId: userId,
        tanggal: { gte: startOfDay, lte: endOfDay },
        status: { not: "REJECTED" }, // Ditolak tidak dihitung
      },
    });

    if (existingUserBooking) {
      return NextResponse.json(
        {
          error:
            "Gagal: Anda sudah memiliki slot booking (Aktif/Pending) pada tanggal ini.",
        },
        { status: 400 },
      );
    }
    // -------------------------------------------------

    // --- REQ #2: Pencegahan Overlap / Bentrok Jam ---
    const checkConflict = await prisma.booking.findFirst({
      where: {
        ruangan,
        tanggal: { gte: startOfDay, lte: endOfDay },
        status: { not: "REJECTED" }, // Hanya cek jadwal yg PENDING/APPROVED
        AND: [
          { waktuMulai: { lt: waktuSelesai } },
          { waktuSelesai: { gt: waktuMulai } },
        ],
      },
    });

    if (checkConflict) {
      return NextResponse.json(
        {
          error:
            "Gagal: Jadwal bentrok (overlap) dengan pemesanan lain di lab dan waktu tersebut.",
        },
        { status: 400 },
      );
    }
    // ------------------------------------------------

    // Insert ke Database
    const newBooking = await prisma.booking.create({
      data: {
        userId,
        ruangan,
        tujuan,
        tanggal: bookingDate,
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
    console.error(error);
    return NextResponse.json(
      { error: "Gagal membuat booking sistem" },
      { status: 500 },
    );
  }
}
