import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { verifyPassword, signUser, SESSION_COOKIE } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = db.findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signUser(user);

  const res = NextResponse.json({ id: user.id, name: user.name });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  return res;
}
