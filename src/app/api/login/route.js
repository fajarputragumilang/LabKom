import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const rawUsername = body.username || body.Username || "";
    const password = body.password || "";

    if (!rawUsername.trim() || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 },
      );
    }

    const cleanUsername = rawUsername.trim().toLowerCase();

    // Gunakan mode insensitive agar kebal dari salah ketik huruf kapital
    const user = await prisma.user.findFirst({
      where: {
        username: { equals: cleanUsername, mode: "insensitive" },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kredensial tidak ditemukan" },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    const { password: _, ...userData } = user;
    const response = NextResponse.json(
      { message: "Login berhasil", user: userData },
      { status: 200 },
    );

    // Server-Side Cookie yang akan dibaca oleh Middleware
    response.cookies.set({
      name: "session_user",
      value: JSON.stringify(userData),
      path: "/",
      maxAge: 60 * 60 * 24, // 1 Hari
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("ERROR API LOGIN:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
