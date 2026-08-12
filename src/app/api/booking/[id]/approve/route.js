import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const id = params.id;
    const reqUsername = request.headers.get("x-username");
    const reqRole = request.headers.get("x-user-role");

    const isAdmin =
      reqUsername === "asepsukandar" ||
      reqUsername === "fajarputragumilang" ||
      reqRole === "ADMIN";
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Hanya Admin yang dapat menyetujui booking" },
        { status: 403 },
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    return NextResponse.json(
      { message: "Booking disetujui (APPROVED)", data: updatedBooking },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menyetujui booking" },
      { status: 500 },
    );
  }
}
