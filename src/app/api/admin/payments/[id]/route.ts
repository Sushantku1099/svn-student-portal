import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import { requireAdmin } from '@/lib/auth';
import { ok, fail } from '@/lib/api';
import { sendMail, paymentApprovedEmail, paymentRejectedEmail } from '@/lib/email';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(); await connectDB();
    const { action, reason } = await req.json();
    const { id } = await params;
    if (!['verify', 'reject', 'pending'].includes(action)) return fail('Invalid action', 422);
    const update: any = {};
    if (action === 'verify') Object.assign(update, { paymentStatus: 'Verified', verifiedAt: new Date(), rejectedAt: null, rejectionReason: '' });
    if (action === 'reject') Object.assign(update, { paymentStatus: 'Rejected', rejectedAt: new Date(), rejectionReason: reason || 'Rejected by admin' });
    if (action === 'pending') Object.assign(update, { paymentStatus: 'Pending', rejectedAt: null, verifiedAt: null });
    const student = await Student.findByIdAndUpdate(id, update, { new: true });
    if (!student) return fail('Student not found', 404);

    if (action === 'verify') {
      const email = paymentApprovedEmail(student);
      await sendMail({ to: student.email, ...email });
    }

    if (action === 'reject') {
      const email = paymentRejectedEmail(student);
      await sendMail({ to: student.email, ...email });
    }

    return ok(student);
  } catch { return fail('Unauthorized', 401); }
}
