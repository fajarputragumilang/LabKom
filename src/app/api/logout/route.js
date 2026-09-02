import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();

    // PERHATIAN: Pastikan 'token' adalah nama cookie yang kamu set saat user login.
    // Jika saat login kamu menggunakan nama cookie lain (misal: 'session_id'), ganti 'token' di bawah ini.
    cookieStore.delete("token");

    // Opsional: Jika ada cookie role, hapus juga
    // cookieStore.delete('role');

    return NextResponse.json(
      { success: true, message: "Logout berhasil, sesi telah dihapus" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Logout API Error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server saat logout" },
      { status: 500 },
    );
  }
}
