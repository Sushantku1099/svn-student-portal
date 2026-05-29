import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import { setAuthCookie, signAdminToken, verifyPassword } from '@/lib/auth';
import { ok, fail } from '@/lib/api';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`login:${ip}`, 8, 60_000).success) return fail('Too many login attempts.', 429);
    const { username, password } = await req.json();
    if (!username || !password) return fail('Username and password are required', 422);
    await connectDB();
    const admin = await Admin.findOne({ username: String(username).toLowerCase() });
    if (!admin || !(await verifyPassword(password, admin.passwordHash))) return fail('Invalid username or password', 401);
    const token = signAdminToken({ adminId: admin._id.toString(), username: admin.username, role: admin.role });
    await setAuthCookie(token);
    return ok({ username: admin.username, role: admin.role });
  } catch {
    return fail('Login failed', 500);
  }
}
