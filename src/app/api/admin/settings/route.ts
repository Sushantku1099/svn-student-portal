import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { settingsSchema } from '@/lib/validation';
import { saveUploadedFile } from '@/lib/file';
import { ok, fail } from '@/lib/api';

export async function GET() {
  try {
    await requireAdmin();
    const s = await getSettings();
    return ok(s);
  } catch { return fail('Unauthorized', 401); }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const contentType = req.headers.get('content-type') || '';
    const settings = await getSettings();
    let data: any = {};
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      data = {
        registrationFee: Number(form.get('registrationFee')),
        certificateVerifyUrl: String(form.get('certificateVerifyUrl')),
        registrationEnabled: form.get('registrationEnabled') === 'true',
        qrEnabled: form.get('qrEnabled') === 'true'
      };
      const qr = form.get('qrCodeImage');
      if (qr instanceof File && qr.size > 0) settings.qrCodeImage = await saveUploadedFile(qr, 'qr');
    } else {
      data = await req.json();
    }
    const parsed = settingsSchema.safeParse(data);
    if (!parsed.success) return fail('Validation failed', 422, parsed.error.flatten());
    Object.assign(settings, parsed.data);
    await settings.save();
    return ok(settings);
  } catch (e: any) { return fail(e.message || 'Settings update failed', 400); }
}
