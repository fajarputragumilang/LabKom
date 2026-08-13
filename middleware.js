import { NextResponse } from "next/server";

export function middleware(request) {
  const session = request.cookies.get("session_user");
  const { pathname } = request.nextUrl;

  // 1. Proteksi Halaman Dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. Redirect jika sudah login
  if (pathname === "/login" || pathname === "/") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
