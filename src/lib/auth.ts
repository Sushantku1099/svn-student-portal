import { cookies } from 'next/headers';
import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import Admin from '@/models/Admin';

const COOKIE_NAME = 'svn_admin_token';

type TokenPayload = { adminId: string; username: string; role: string };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAdminToken(payload: TokenPayload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is missing');

  // jsonwebtoken typings require expiresIn to be a specific StringValue/number type.
  // Environment variables are typed as plain string, so we narrow it through SignOptions.
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn']
  };

  return jwt.sign(payload, secret, options);
}

export async function setAuthCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getAdminFromRequest() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const decoded = jwt.verify(token, secret) as TokenPayload;
    await connectDB();
    const admin = await Admin.findById(decoded.adminId).select('-passwordHash');
    return admin;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getAdminFromRequest();
  if (!admin) throw new Error('UNAUTHORIZED');
  return admin;
}
