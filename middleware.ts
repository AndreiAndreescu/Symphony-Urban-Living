import { NextResponse, type NextRequest } from "next/server";

// Fast redirect for signed-out visitors. The real session check (signature,
// active user, role) happens on the server in lib/session.ts for every page and action.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  if (!request.cookies.has("su_admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
