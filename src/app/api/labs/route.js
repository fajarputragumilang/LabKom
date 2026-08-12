import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Mengambil daftar semua laboratorium untuk dropdown form booking
export async function GET() {
  try {
    const labs = await prisma.lab.findMany({
      orderBy: { nama: "asc" },
    });
    return NextResponse.json(labs, { status: 200 });
  } catch (error) {
    console.error("ERROR GET LABS:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data laboratorium" },
      { status: 500 },
    );
  }
}
