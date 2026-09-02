import { NextResponse } from "next/server";

export function middleware(request) {
  const session = request.cookies.get("session_user");
  const { pathname } = request.nextUrl;

  // 1. Proteksi Halaman Dashboard dan Root URL (Jika belum login)
  if (!session && (pathname.startsWith("/dashboard") || pathname === "/")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Redirect jika sudah login (Mencegah user bolak-balik ke Login atau Root)
  if (session && (pathname === "/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
