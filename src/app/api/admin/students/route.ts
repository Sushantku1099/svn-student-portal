import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import { requireAdmin } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';
    const branch = searchParams.get('branch') || '';
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
    const filter: any = {};
    if (status) filter.paymentStatus = status;
    if (branch) filter.branch = branch;
    if (q) filter.$or = [
      { fullName: new RegExp(q, 'i') },
      { registrationId: new RegExp(q, 'i') },
      { mobile: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { registrationNumber: new RegExp(q, 'i') }
    ];
    const [students, total] = await Promise.all([
      Student.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Student.countDocuments(filter)
    ]);
    return ok({ students, total, page, pages: Math.ceil(total / limit) });
  } catch {
    return fail('Unauthorized', 401);
  }
}
