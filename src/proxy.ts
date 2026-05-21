import { AUTH_COOKIE } from "@/lib/auth/constants";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  const hasSession = request.cookies.get(AUTH_COOKIE)?.value === "1";

  if (!isPublicPath && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && hasSession) {
    const overviewUrl = request.nextUrl.clone();
    overviewUrl.pathname = "/overview";
    overviewUrl.search = "";
    return NextResponse.redirect(overviewUrl);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
