'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

export default function StatusPage() {
  const [registrationId, setRegistrationId] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<any>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStudent(null);
    try {
      const res = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, mobile })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Status check failed');
      setStudent(json.data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const status = student?.paymentStatus;
  const Icon = status === 'Verified' ? CheckCircle2 : status === 'Rejected' ? XCircle : Clock;
  const color = status === 'Verified' ? 'text-green-600 bg-green-50 border-green-200' : status === 'Rejected' ? 'text-red-600 bg-red-50 border-red-200' : 'text-amber-600 bg-amber-50 border-amber-200';

  return (
    <>
      <Navbar />
      <main className="container-pad min-h-[70vh] py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black">Check Registration Status</h1>
            <p className="mt-3 text-slate-600">Enter your registration ID and mobile number to know whether your payment is pending, verified or rejected.</p>
          </div>

          <form onSubmit={submit} className="card p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="label">Registration ID</label>
                <input className="input uppercase" placeholder="SVN2026-0001" value={registrationId} onChange={(e) => setRegistrationId(e.target.value)} required />
              </div>
              <div>
                <label className="label">Mobile Number</label>
                <input className="input" placeholder="10 digit mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} pattern="[6-9][0-9]{9}" required />
              </div>
            </div>
            <button disabled={loading} className="btn-primary mt-5 w-full"><Search size={18} /> {loading ? 'Checking...' : 'Check Status'}</button>
          </form>

          {student && (
            <div className={`mt-6 rounded-3xl border p-6 ${color}`}>
              <div className="flex items-start gap-4">
                <Icon className="h-10 w-10 shrink-0" />
                <div>
                  <h2 className="text-2xl font-black">Payment {student.paymentStatus}</h2>
                  <p className="mt-2 text-sm"><b>Registration ID:</b> {student.registrationId}</p>
                  <p className="text-sm"><b>Name:</b> {student.fullName}</p>
                  <p className="text-sm"><b>Payment Mode:</b> {student.paymentMode}</p>
                  {(student.paymentId || student.utrNumber) && <p className="text-sm"><b>Payment ID/UTR:</b> {student.paymentId || student.utrNumber}</p>}
                  {student.paymentStatus === 'Pending' && <p className="mt-3 text-sm font-semibold">Your payment proof is submitted and waiting for admin verification.</p>}
                  {student.paymentStatus === 'Verified' && <p className="mt-3 text-sm font-semibold">Your payment is successful and your registration is confirmed.</p>}
                  {student.paymentStatus === 'Rejected' && <p className="mt-3 text-sm font-semibold">Reason: {student.rejectionReason || 'Rejected by admin. Please contact office.'}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
