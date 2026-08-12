import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const inputUsername = body.username || body.Username;
    const password = body.password;

    if (!inputUsername || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { username: inputUsername.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Username atau kredensial tidak ditemukan" },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    const { password: _, ...userData } = user;

    return NextResponse.json(
      { message: "Login berhasil", user: userData },
      { status: 200 },
    );
  } catch (error) {
    console.error("ERROR API LOGIN:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
