import { auth } from "./auth";
import { NextResponse } from "next/server";

const protectedApiPaths = ["/api/generate", "/api/test", "/api/fix"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (protectedApiPaths.some((p) => pathname.startsWith(p))) {
    if (!req.auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/api/generate", "/api/test", "/api/fix"],
};
