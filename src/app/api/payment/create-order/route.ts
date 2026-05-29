import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import { ok, fail } from '@/lib/api';
import { getSettings } from '@/lib/settings';
import { studentSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are not configured');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`rzp-order:${ip}`, 10, 60_000).success) return fail('Too many payment attempts. Please wait.', 429);

    const body = await req.json();
    const parsed = studentSchema.safeParse(body.student || body);
    if (!parsed.success) return fail('Validation failed', 422, parsed.error.flatten());

    await connectDB();
    const existing = await Student.findOne({
      $or: [
        { email: parsed.data.email.toLowerCase() },
        { mobile: parsed.data.mobile },
        { registrationNumber: parsed.data.registrationNumber }
      ]
    });
    if (existing) return fail('A registration already exists for this email, mobile or college registration number.', 409);

    const settings = await getSettings();
    if (!settings.registrationEnabled) return fail('Registration is currently closed.', 403);
    if (!settings.registrationFee || settings.registrationFee <= 0) return fail('Invalid registration fee configured.', 400);

    const razorpay = getRazorpay();
    const amountPaise = Math.round(Number(settings.registrationFee) * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `svn_reg_${Date.now()}`,
      notes: {
        fullName: parsed.data.fullName,
        mobile: parsed.data.mobile,
        email: parsed.data.email,
        purpose: 'Student Registration Fee'
      }
    });

    return ok({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      registrationFee: settings.registrationFee,
      companyName: 'SVN Infra & Solar Service Pvt Ltd'
    });
  } catch (e: any) {
    return fail(e.message || 'Unable to create Razorpay order', 500);
  }
}
