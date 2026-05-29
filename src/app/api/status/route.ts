import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import { ok, fail } from '@/lib/api';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`status:${ip}`, 20, 60_000).success) return fail('Too many attempts. Please wait.', 429);

    const { registrationId, mobile } = await req.json();
    if (!registrationId || !mobile) return fail('Registration ID and mobile number are required', 422);

    await connectDB();
    const student = await Student.findOne({
      registrationId: String(registrationId).trim().toUpperCase(),
      mobile: String(mobile).trim()
    }).select('registrationId fullName email mobile paymentStatus paymentMode paymentId utrNumber paymentTimestamp verifiedAt rejectedAt rejectionReason createdAt');

    if (!student) return fail('No registration found with these details.', 404);

    return ok(student);
  } catch (e: any) {
    return fail(e.message || 'Unable to check status', 500);
  }
}
