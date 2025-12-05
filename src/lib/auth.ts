import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "./db";
import { User } from "./types";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
export const SESSION_COOKIE = "hallowallet_token";

export async function hashPassword(pw: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export function signUser(user: User) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
}

// Read-only: used in server components/layouts/route handlers
export function getCurrentUser(): User | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    return db.getUserById(payload.sub) || null;
  } catch {
    return null;
  }
}
