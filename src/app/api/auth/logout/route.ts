import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "../../../../lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  
  // Clear the session cookie
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0 // Expire immediately
  });
  
  return res;
}
