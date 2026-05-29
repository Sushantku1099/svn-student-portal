import { z } from 'zod';

const phone = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10 digit Indian mobile number');

export const studentSchema = z.object({
  fullName: z.string().min(2).max(120),
  fatherName: z.string().min(2).max(120),
  dob: z.string().min(1),
  gender: z.enum(['Male', 'Female', 'Other']),
  mobile: phone,
  alternateMobile: z.string().optional().refine(v => !v || /^[6-9]\d{9}$/.test(v), 'Invalid alternate mobile'),
  email: z.string().email(),
  collegeName: z.string().min(1),
  customCollegeName: z.string().optional(),
  registrationNumber: z.string().min(2).max(80),
  branch: z.string().min(1),
  customBranch: z.string().optional(),
  session: z.string().min(1),
  customSession: z.string().optional(),
  paymentId: z.string().optional(),
  utrNumber: z.string().optional(),
  paymentMode: z.enum(['Razorpay', 'ManualQR']).optional()
}).superRefine((data, ctx) => {
  if (data.collegeName === 'Others' && !data.customCollegeName?.trim()) ctx.addIssue({ code: 'custom', path: ['customCollegeName'], message: 'College name is required' });
  if (data.branch === 'Others' && !data.customBranch?.trim()) ctx.addIssue({ code: 'custom', path: ['customBranch'], message: 'Branch name is required' });
  if (data.session === 'Others' && !data.customSession?.trim()) ctx.addIssue({ code: 'custom', path: ['customSession'], message: 'Session is required' });
});

export const settingsSchema = z.object({
  registrationFee: z.coerce.number().min(0),
  certificateVerifyUrl: z.string().url(),
  registrationEnabled: z.boolean(),
  qrEnabled: z.boolean()
});
