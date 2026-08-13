import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

const ADMIN_USERS = ["fajarputragumilang", "asepsukandar"];

// Fungsi Helper untuk memvalidasi admin dari JSON Cookie
async function isAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_user')?.value;

  if (!sessionCookie) return false;

  try {
    const userData = JSON.parse(sessionCookie);
    return userData.username && ADMIN_USERS.includes(userData.username);
  } catch (error) {
    console.error("Gagal melakukan parse cookie:", error);
    return false;
  }
}

// METHOD PUT: Untuk Edit Data Booking
export async function PUT(request, { params }) {
  try {
    const isUserAdmin = await isAdmin();
    
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Hanya Admin yang dapat mengedit data ini.' },
        { status: 403 }
      );
    }

    // Ekstrak ID dengan aman (mendukung Next.js 15+)
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    
    // Cek eksistensi data sebelum update
    const existingBooking = await prisma.booking.findUnique({
      where: { id: String(id) },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Pemesanan tidak ditemukan. Data mungkin sudah dihapus.' },
        { status: 404 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: String(id) },
      data: {
        ...body 
      },
    });

    return NextResponse.json(
      { message: 'Pemesanan berhasil diperbarui.', data: updatedBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error('ERROR PUT /api/booking/[id]:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Data pemesanan tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server', details: error.message },
      { status: 500 }
    );
  }
}

// METHOD DELETE: Untuk Hapus Data Booking
export async function DELETE(request, { params }) {
  try {
    const isUserAdmin = await isAdmin();
    
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Hanya Admin yang dapat menghapus data ini.' },
        { status: 403 }
      );
    }

    // Ekstrak ID dengan aman (mendukung Next.js 15+)
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Cek eksistensi data sebelum melakukan delete
    const existingBooking = await prisma.booking.findUnique({
      where: { id: String(id) },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Pemesanan tidak ditemukan atau sudah dihapus sebelumnya.' },
        { status: 404 }
      );
    }

    await prisma.booking.delete({
      where: { id: String(id) },
    });

    return NextResponse.json(
      { message: 'Pemesanan berhasil dihapus.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('ERROR DELETE /api/booking/[id]:', error);
    
    // Fallback penanganan error kode P2025 dari Prisma
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Data pemesanan tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server', details: error.message },
      { status: 500 }
    );
  }
}