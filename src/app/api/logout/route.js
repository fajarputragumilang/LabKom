import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();

    // PERBAIKAN: Gunakan nama cookie yang sama persis dengan di middleware.js
    cookieStore.delete("session_user");

    return NextResponse.json(
      { success: true, message: "Sesi berhasil dihapus" },
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
