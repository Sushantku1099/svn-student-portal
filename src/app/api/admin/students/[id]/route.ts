import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import { requireAdmin } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(); await connectDB();
    const { id } = await params;
    const student = await Student.findById(id);
    if (!student) return fail('Student not found', 404);
    return ok(student);
  } catch { return fail('Unauthorized', 401); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(); await connectDB();
    const { id } = await params;
    const body = await req.json();
    delete body._id; delete body.registrationId;
    const student = await Student.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!student) return fail('Student not found', 404);
    return ok(student);
  } catch (e: any) { return fail(e.message || 'Update failed', 400); }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(); await connectDB();
    const { id } = await params;
    await Student.findByIdAndDelete(id);
    return ok({});
  } catch { return fail('Unauthorized', 401); }
}
