import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logout berhasil" },
    { status: 200 },
  );

  // Hancurkan Server Cookie
  response.cookies.set({
    name: "session_user",
    value: "",
    path: "/",
    maxAge: 0,
  });

  return response;
}
