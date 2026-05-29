import { getAdminFromRequest } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

export async function GET() {
  const admin = await getAdminFromRequest();
  if (!admin) return fail('Unauthorized', 401);
  return ok(admin);
}
