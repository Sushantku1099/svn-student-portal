import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import { requireAdmin } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const start = new Date(); start.setHours(0,0,0,0);
    const [total, verified, pending, today, rejected] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ paymentStatus: 'Verified' }),
      Student.countDocuments({ paymentStatus: 'Pending' }),
      Student.countDocuments({ createdAt: { $gte: start } }),
      Student.countDocuments({ paymentStatus: 'Rejected' })
    ]);
    return ok({ total, verified, pending, today, rejected });
  } catch {
    return fail('Unauthorized', 401);
  }
}
