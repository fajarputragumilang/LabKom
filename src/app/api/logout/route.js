import { NextResponse } from "next/server";

export async function POST() {
  // 1. Buat object response terlebih dahulu
  const response = NextResponse.json(
    { success: true, message: "Sesi berhasil dihapus secara total" },
    { status: 200 },
  );

  // 2. Timpa cookie langsung pada header response (Cara paling ampuh di Vercel)
  response.cookies.set({
    name: "session_user",
    value: "",
    path: "/",
    expires: new Date(0), // Set ke tahun 1970
    maxAge: 0,
  });

  return response;
}
