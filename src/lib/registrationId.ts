import Student from '@/models/Student';

export async function generateRegistrationId() {
  const year = new Date().getFullYear();
  const prefix = `SVN${year}-`;
  const last = await Student.findOne({ registrationId: new RegExp(`^${prefix}`) })
    .sort({ createdAt: -1 })
    .select('registrationId');
  const next = last?.registrationId ? Number(last.registrationId.split('-')[1]) + 1 : 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}
