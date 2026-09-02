import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();

    // Hapus cookie secara agresif dengan menimpa masa aktifnya ke masa lalu
    cookieStore.set("session_user", "", {
      path: "/", // Wajib: agar terhapus di seluruh rute
      expires: new Date(0), // Set waktu ke 1 Jan 1970
      maxAge: 0,
    });

    // Lapis kedua penghapusan native
    cookieStore.delete("session_user");

    return NextResponse.json(
      { success: true, message: "Sesi berhasil dihapus secara total" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Logout API Error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server saat logout" },
      { status: 500 },
    );
  }
}
