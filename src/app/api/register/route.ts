import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import { studentSchema } from '@/lib/validation';
import { saveUploadedFile } from '@/lib/file';
import { generateRegistrationId } from '@/lib/registrationId';
import { getSettings } from '@/lib/settings';
import { ok, fail } from '@/lib/api';
import { rateLimit } from '@/lib/rateLimit';
import { sendMail, registrationPendingEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`register:${ip}`, 5, 60_000).success) return fail('Too many attempts. Please wait.', 429);

    await connectDB();
    const settings = await getSettings();
    if (!settings.registrationEnabled) return fail('Registration is currently closed.', 403);

    const form = await req.formData();
    const body = Object.fromEntries(form.entries());
    const parsed = studentSchema.safeParse(body);
    if (!parsed.success) return fail('Validation failed', 422, parsed.error.flatten());

    const existing = await Student.findOne({
      $or: [{ email: parsed.data.email.toLowerCase() }, { mobile: parsed.data.mobile }, { registrationNumber: parsed.data.registrationNumber }]
    });
    if (existing) return fail('A registration already exists for this email, mobile or college registration number.', 409);

    let paymentScreenshot = '';
    const proof = form.get('paymentScreenshot');
    if (proof instanceof File && proof.size > 0) paymentScreenshot = await saveUploadedFile(proof, 'payment-proofs');

    if (!parsed.data.paymentId?.trim() && !parsed.data.utrNumber?.trim()) {
      return fail('UTR number or transaction ID is required for manual verification.', 422);
    }

    if (!paymentScreenshot) {
      return fail('Payment screenshot is required for manual verification.', 422);
    }

    const registrationId = await generateRegistrationId();
    const student = await Student.create({
      ...parsed.data,
      dob: new Date(parsed.data.dob),
      email: parsed.data.email.toLowerCase(),
      registrationId,
      paymentScreenshot,
      paymentMode: 'ManualQR',
      utrNumber: parsed.data.utrNumber || parsed.data.paymentId,
      paymentTimestamp: new Date(),
      paymentStatus: 'Pending'
    });

    const email = registrationPendingEmail(student);
    await sendMail({ to: student.email, ...email });

    return ok({ registrationId: student.registrationId, paymentStatus: student.paymentStatus }, 201);
  } catch (e: any) {
    return fail(e.message || 'Registration failed', 500);
  }
}
