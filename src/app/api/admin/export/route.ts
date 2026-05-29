import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import { fail } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(); await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';
    const filter: any = {};
    if (status) filter.paymentStatus = status;
    if (q) filter.$or = [
      { fullName: new RegExp(q, 'i') }, { registrationId: new RegExp(q, 'i') }, { mobile: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }
    ];
    const students = await Student.find(filter).sort({ createdAt: -1 }).lean();
    const rows = students.map((s: any) => ({
      'Registration ID': s.registrationId,
      'Full Name': s.fullName,
      'Father Name': s.fatherName,
      'DOB': s.dob ? new Date(s.dob).toLocaleDateString('en-IN') : '',
      'Gender': s.gender,
      'Mobile': s.mobile,
      'Alternate Mobile': s.alternateMobile,
      'Email': s.email,
      'College': s.collegeName === 'Others' ? s.customCollegeName : s.collegeName,
      'College Registration No.': s.registrationNumber,
      'Branch': s.branch === 'Others' ? s.customBranch : s.branch,
      'Session': s.session === 'Others' ? s.customSession : s.session,
      'Payment Status': s.paymentStatus,
      'Payment Mode': s.paymentMode,
      'Payment ID': s.paymentId,
      'UTR Number': s.utrNumber,
      'Razorpay Order ID': s.razorpayOrderId,
      'Payment Timestamp': s.paymentTimestamp ? new Date(s.paymentTimestamp).toLocaleString('en-IN') : '',
      'Created At': s.createdAt ? new Date(s.createdAt).toLocaleString('en-IN') : ''
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Students');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="svn-students-${Date.now()}.xlsx"`
      }
    });
  } catch { return fail('Unauthorized', 401); }
}
