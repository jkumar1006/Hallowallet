import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Email verified" });
}
