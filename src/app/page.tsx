import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, CreditCard, FileText, GraduationCap, ShieldCheck, Sun } from 'lucide-react';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const settings = await getSettings();
  const steps = [
    ['Fill Registration Form', 'Enter personal, college, branch and session details.'],
    ['Pay Registration Fee', `Scan the Razorpay QR and pay ₹${settings.registrationFee}.`],
    ['Upload Proof', 'Submit payment screenshot / transaction ID for admin verification.'],
    ['Receive Confirmation', 'Track registration using your generated registration ID.']
  ];
  return <>
    <Navbar />
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-amber-50">
        <div className="container-pad grid min-h-[620px] items-center gap-10 py-16 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-700 shadow"><Sun size={16}/> SVN Infra & Solar Service Pvt Ltd</div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">Student Registration Portal</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Register for training/program enrollment, complete fee payment with Razorpay QR, and manage certificate verification from a secure professional portal.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="btn-primary">Register Now <ArrowRight size={18}/></Link><a href={settings.certificateVerifyUrl} target="_blank" className="btn-secondary"><ShieldCheck size={18}/> Verify Certificate</a></div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3"><div className="card p-4"><p className="text-xs font-bold text-slate-500">Fee</p><p className="text-2xl font-black">₹{settings.registrationFee}</p></div><div className="card p-4"><p className="text-xs font-bold text-slate-500">Status</p><p className="text-lg font-black text-brand-700">{settings.registrationEnabled ? 'Open' : 'Closed'}</p></div><div className="card p-4"><p className="text-xs font-bold text-slate-500">Mode</p><p className="text-lg font-black">Online</p></div></div>
          </div>
          <div className="card relative p-6"><div className="rounded-3xl bg-slate-950 p-6 text-white"><GraduationCap className="mb-8 h-16 w-16 text-solar"/><h2 className="text-3xl font-black">Fast, transparent & secure registration</h2><p className="mt-4 text-slate-300">Admin-controlled fees, QR code, payment verification, Excel export and certificate redirection.</p><div className="mt-8 grid gap-3">{['MongoDB backed data storage','JWT protected dashboard','Excel export ready','Mobile optimized UI'].map(x => <div key={x} className="flex items-center gap-3"><CheckCircle2 className="text-brand-500"/> {x}</div>)}</div></div></div>
        </div>
      </section>
      <section className="container-pad py-16"><div className="mb-10 text-center"><h2 className="text-3xl font-black">How to Register</h2><p className="mt-3 text-slate-600">Complete registration in four simple steps.</p></div><div className="grid gap-5 md:grid-cols-4">{steps.map((s, i) => <div key={s[0]} className="card p-6"><div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 font-black text-brand-700">{i+1}</div><h3 className="font-bold">{s[0]}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{s[1]}</p></div>)}</div></section>
      <section className="container-pad grid gap-6 md:grid-cols-3"><div className="card p-6"><FileText className="text-brand-600"/><h3 className="mt-3 font-bold">Required Details</h3><p className="mt-2 text-sm text-slate-600">Name, father name, DOB, mobile, email, college registration number, branch and session.</p></div><div className="card p-6"><CreditCard className="text-brand-600"/><h3 className="mt-3 font-bold">Payment Proof</h3><p className="mt-2 text-sm text-slate-600">Pay using Razorpay QR and upload screenshot / transaction ID.</p></div><div className="card p-6"><ShieldCheck className="text-brand-600"/><h3 className="mt-3 font-bold">Verification</h3><p className="mt-2 text-sm text-slate-600">Certificate verification button redirects to the configured live verification website.</p></div></section>
    </main>
    <Footer />
  </>;
}
