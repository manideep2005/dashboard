import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isProtected = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/settings");
  const isOnLogin = nextUrl.pathname === "/login";
  const isOnRoot = nextUrl.pathname === "/";

  if (isOnRoot && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon-.*).*)"],
};
