import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { hashPassword } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, newPassword } = body;

  if (!email || !newPassword) {
    return NextResponse.json({ error: "Email and new password are required" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password in database
  const updated = db.updateUserPassword(user.id, hashedPassword);
  if (!updated) {
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Password reset successful" });
}
