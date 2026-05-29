import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import { studentSchema } from '@/lib/validation';
import { generateRegistrationId } from '@/lib/registrationId';
import { ok, fail } from '@/lib/api';
import { rateLimit } from '@/lib/rateLimit';
import { sendMail, paymentApprovedEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`rzp-verify:${ip}`, 20, 60_000).success) return fail('Too many verification attempts. Please wait.', 429);

    const body = await req.json();
    const {
      student,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return fail('Missing Razorpay payment verification fields', 422);
    }
    if (!process.env.RAZORPAY_KEY_SECRET) return fail('Razorpay secret is not configured', 500);

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return fail('Payment signature verification failed', 400);
    }

    const parsed = studentSchema.safeParse({ ...student, paymentId: razorpay_payment_id });
    if (!parsed.success) return fail('Validation failed', 422, parsed.error.flatten());

    await connectDB();

    const paymentAlreadyUsed = await Student.findOne({ paymentId: razorpay_payment_id });
    if (paymentAlreadyUsed) return fail('This payment has already been used for a registration.', 409);

    const existing = await Student.findOne({
      $or: [
        { email: parsed.data.email.toLowerCase() },
        { mobile: parsed.data.mobile },
        { registrationNumber: parsed.data.registrationNumber }
      ]
    });
    if (existing) return fail('A registration already exists for this email, mobile or college registration number.', 409);

    const registrationId = await generateRegistrationId();
    const created = await Student.create({
      ...parsed.data,
      dob: new Date(parsed.data.dob),
      email: parsed.data.email.toLowerCase(),
      registrationId,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      paymentMode: 'Razorpay',
      paymentStatus: 'Verified',
      paymentTimestamp: new Date(),
      verifiedAt: new Date()
    });

    const email = paymentApprovedEmail(created);
    await sendMail({ to: created.email, ...email });

    return ok({
      registrationId: created.registrationId,
      paymentStatus: created.paymentStatus,
      paymentId: created.paymentId
    }, 201);
  } catch (e: any) {
    return fail(e.message || 'Payment verification failed', 500);
  }
}
