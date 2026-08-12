import { NextResponse } from "next/server";

// Proteksi route /dashboard dan /api/booking
// Jika tidak ada cookie sesi, arahkan ke /login
export function proxy(request) {
  const Username = request.cookies.get("auth_username")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedApi = pathname.startsWith("/api/booking");
  const isProtectedPage = pathname.startsWith("/dashboard");

  if (!Username && (isProtectedApi || isProtectedPage)) {
    if (isProtectedApi) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Silakan login terlebih dahulu.",
        },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/booking/:path*"],
};
