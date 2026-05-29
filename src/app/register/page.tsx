'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { CheckCircle2, CreditCard, QrCode, ShieldCheck, Upload } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const initial = {
  fullName: '',
  fatherName: '',
  dob: '',
  gender: '',
  mobile: '',
  alternateMobile: '',
  email: '',
  collegeName: 'Government Polytechnic Banka',
  customCollegeName: '',
  registrationNumber: '',
  branch: 'Electronic Engineering',
  customBranch: '',
  session: '2024-2027',
  customSession: '',
  paymentId: '',
  utrNumber: ''
};

type PaymentMode = 'Razorpay' | 'ManualQR';

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RegisterPage() {
  const [settings, setSettings] = useState<any>(null);
  const [form, setForm] = useState(initial);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Razorpay');
  const [proof, setProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((j) => setSettings(j.data))
      .catch(() => toast.error('Unable to load settings'));
  }, []);

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (paymentMode === 'Razorpay') return startRazorpayPayment();
    return submitManualPayment();
  }

  async function startRazorpayPayment() {
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Unable to load Razorpay Checkout. Please use manual QR verification or check internet.');

      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student: { ...form, paymentMode: 'Razorpay' } })
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderJson.message || 'Unable to create payment order');
      const order = orderJson.data;

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'SVN Infra & Solar Service Pvt Ltd',
        description: 'Student Registration Fee',
        order_id: order.orderId,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.mobile
        },
        notes: {
          collegeRegistrationNo: form.registrationNumber,
          branch: form.branch === 'Others' ? form.customBranch : form.branch,
          session: form.session === 'Others' ? form.customSession : form.session
        },
        theme: { color: '#059669' },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                student: { ...form, paymentMode: 'Razorpay' },
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyJson = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyJson.message || 'Payment verification failed');
            setDone(verifyJson.data);
            toast.success('Payment verified and registration completed');
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.error('Payment cancelled. You can use manual QR verification if needed.');
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        setLoading(false);
        toast.error(response.error?.description || 'Payment failed. Please try manual QR verification.');
      });
      razorpay.open();
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || 'Payment could not be started');
    }
  }

  async function submitManualPayment() {
    if (!form.utrNumber.trim() && !form.paymentId.trim()) {
      toast.error('Enter UTR number or transaction ID');
      return;
    }
    if (!proof) {
      toast.error('Upload payment screenshot for admin verification');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries({ ...form, paymentMode: 'ManualQR' }).forEach(([k, v]) => fd.append(k, v));
      fd.append('paymentScreenshot', proof);

      const res = await fetch('/api/register', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Manual registration failed');
      setDone(json.data);
      toast.success('Submitted for admin payment verification');
    } catch (err: any) {
      toast.error(err.message || 'Manual registration failed');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    const verified = done.paymentStatus === 'Verified';
    return (
      <>
        <Navbar />
        <main className="container-pad grid min-h-[70vh] place-items-center py-16">
          <div className="card max-w-xl p-8 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-brand-600" />
            <h1 className="mt-4 text-3xl font-black">{verified ? 'Registration Completed' : 'Registration Submitted'}</h1>
            <p className="mt-3 text-slate-600">
              {verified
                ? 'Your payment was verified automatically through Razorpay.'
                : 'Your manual payment proof was submitted. Admin will verify your UTR/transaction ID and screenshot.'}
            </p>
            <div className="mt-6 rounded-2xl bg-brand-50 p-5">
              <p className="text-sm font-bold text-slate-500">Registration ID</p>
              <p className="text-3xl font-black text-brand-700">{done.registrationId}</p>
              {done.paymentId && <p className="mt-2 text-xs text-slate-500">Payment ID: {done.paymentId}</p>}
              <p className="mt-2 text-xs font-bold text-slate-600">Status: {done.paymentStatus}</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center"><button onClick={() => (location.href = '/')} className="btn-primary">Go to Home</button><button onClick={() => (location.href = '/status')} className="btn-secondary">Check Payment Status</button></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-br from-slate-50 to-brand-50 py-10">
        <div className="container-pad">
          <div className="mb-8">
            <h1 className="text-3xl font-black">Student Registration</h1>
            <p className="mt-2 text-slate-600">Pay automatically with Razorpay or use manual QR verification with UTR, transaction ID and screenshot.</p>
          </div>

          {settings && !settings.registrationEnabled ? (
            <div className="card p-8 text-center">
              <h2 className="text-2xl font-black text-red-600">Registration Closed</h2>
              <p className="mt-2 text-slate-600">Please contact administration for details.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_400px]">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Full Name" value={form.fullName} onChange={(v: string) => set('fullName', v)} required />
                  <Field label="Father Name" value={form.fatherName} onChange={(v: string) => set('fatherName', v)} required />
                  <Field label="Date of Birth" type="date" value={form.dob} onChange={(v: string) => set('dob', v)} required />
                  <Select label="Gender" value={form.gender} onChange={(v: string) => set('gender', v)} options={['', 'Male', 'Female', 'Other']} required />
                  <Field label="Mobile Number" value={form.mobile} onChange={(v: string) => set('mobile', v)} required pattern="[6-9][0-9]{9}" />
                  <Field label="Alternate Mobile" value={form.alternateMobile} onChange={(v: string) => set('alternateMobile', v)} pattern="[6-9][0-9]{9}" />
                  <Field label="Email" type="email" value={form.email} onChange={(v: string) => set('email', v)} required />
                  <Select label="College Name" value={form.collegeName} onChange={(v: string) => set('collegeName', v)} options={['Government Polytechnic Banka', 'Others']} required />
                  {form.collegeName === 'Others' && <Field label="Enter College Name" value={form.customCollegeName} onChange={(v: string) => set('customCollegeName', v)} required />}
                  <Field label="College Registration No." value={form.registrationNumber} onChange={(v: string) => set('registrationNumber', v)} required />
                  <Select label="Branch" value={form.branch} onChange={(v: string) => set('branch', v)} options={['Electronic Engineering', 'Computer Science and Engineering', 'Electrical Engineering', 'Others']} required />
                  {form.branch === 'Others' && <Field label="Enter Branch Name" value={form.customBranch} onChange={(v: string) => set('customBranch', v)} required />}
                  <Select label="Session" value={form.session} onChange={(v: string) => set('session', v)} options={['2024-2027', '2025-2028', 'Others']} required />
                  {form.session === 'Others' && <Field label="Enter Session" value={form.customSession} onChange={(v: string) => set('customSession', v)} required />}
                </div>
              </motion.div>

              <aside className="space-y-6">
                <div className="card p-6">
                  <h2 className="text-xl font-black">Payment</h2>
                  <p className="mt-1 text-sm text-slate-500">Registration Fee: <b>₹{settings?.registrationFee ?? '...'}</b></p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setPaymentMode('Razorpay')} className={`rounded-2xl border p-4 text-left ${paymentMode === 'Razorpay' ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white'}`}>
                      <CreditCard className="text-brand-600" />
                      <p className="mt-2 font-bold">Razorpay</p>
                      <p className="text-xs text-slate-500">Auto verification</p>
                    </button>
                    <button type="button" onClick={() => setPaymentMode('ManualQR')} className={`rounded-2xl border p-4 text-left ${paymentMode === 'ManualQR' ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white'}`}>
                      <QrCode className="text-brand-600" />
                      <p className="mt-2 font-bold">Manual QR</p>
                      <p className="text-xs text-slate-500">Admin verifies</p>
                    </button>
                  </div>

                  {paymentMode === 'Razorpay' ? (
                    <div className="mt-5 rounded-2xl bg-brand-50 p-5">
                      <ShieldCheck className="text-brand-700" />
                      <h3 className="mt-3 font-bold text-brand-900">Automatic Razorpay Verification</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">Pay online. Server verifies Razorpay signature and generates registration ID instantly.</p>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {settings?.qrEnabled && settings?.qrCodeImage ? (
                        <img src={settings.qrCodeImage} alt="Payment QR" className="w-full rounded-2xl border bg-white p-3" />
                      ) : (
                        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">QR code is not active. Contact admin.</div>
                      )}
                      <Field label="UTR Number" value={form.utrNumber} onChange={(v: string) => set('utrNumber', v)} />
                      <Field label="Transaction ID / Reference No." value={form.paymentId} onChange={(v: string) => set('paymentId', v)} />
                      <div>
                        <label className="label">Upload Payment Screenshot *</label>
                        <label className="flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-slate-300 p-5 text-center hover:bg-slate-50">
                          <Upload />
                          <span className="mt-2 text-sm font-semibold">{proof ? proof.name : 'Choose image/pdf'}</span>
                          <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="hidden" onChange={(e) => setProof(e.target.files?.[0] || null)} />
                        </label>
                      </div>
                      <p className="text-xs leading-5 text-slate-500">Manual payments remain Pending until admin verifies UTR/transaction ID and screenshot.</p>
                    </div>
                  )}

                  <button disabled={loading} className="btn-primary mt-5 w-full">
                    {loading ? 'Processing...' : paymentMode === 'Razorpay' ? `Pay ₹${settings?.registrationFee ?? ''} & Register` : 'Submit for Admin Verification'}
                  </button>
                </div>
              </aside>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Field({ label, value, onChange, type = 'text', required = false, pattern }: any) {
  return <div><label className="label">{label}{required && ' *'}</label><input className="input" type={type} value={value} required={required} pattern={pattern} onChange={(e) => onChange(e.target.value)} /></div>;
}

function Select({ label, value, onChange, options, required = false }: any) {
  return <div><label className="label">{label}{required && ' *'}</label><select className="input" value={value} required={required} onChange={(e) => onChange(e.target.value)}>{options.map((o: string) => <option key={o} value={o}>{o || 'Select'}</option>)}</select></div>;
}
