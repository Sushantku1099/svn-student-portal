import { ok, fail } from '@/lib/api';
import { getSettings } from '@/lib/settings';

export async function GET() {
  try {
    const s = await getSettings();
    return ok({
      registrationFee: s.registrationFee,
      qrCodeImage: s.qrCodeImage,
      certificateVerifyUrl: s.certificateVerifyUrl,
      registrationEnabled: s.registrationEnabled,
      qrEnabled: s.qrEnabled
    });
  } catch (e) {
    return fail('Unable to load settings', 500);
  }
}
