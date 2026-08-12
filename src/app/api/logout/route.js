import { NextResponse } from "next/server";

// Endpoint untuk logout: menghapus cookie sesi
export async function GET() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil",
  });
  response.cookies.set("auth_username", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // langsung hapus cookie
  });
  return response;
}
