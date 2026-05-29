'use client';
import Link from 'next/link';
import { Menu, X, ShieldCheck, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Settings = { certificateVerifyUrl: string };

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [verifyUrl, setVerifyUrl] = useState('#');
  useEffect(() => { fetch('/api/settings').then(r => r.json()).then(j => setVerifyUrl(j.data?.certificateVerifyUrl || '#')).catch(() => {}); }, []);
  const links = [
    ['Home', '/'], ['Register', '/register'], ['Check Status', '/status'], ['Contact', '/#contact'], ['Admin Login', '/admin/login']
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-pad flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-extrabold text-slate-900">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-solar text-white"><Sun size={22}/></span>
          <span className="leading-tight">SVN Infra & Solar<br/><span className="text-xs font-semibold text-slate-500">Student Portal</span></span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map(([label, href]) => <Link key={label} href={href} className="text-sm font-semibold text-slate-700 hover:text-brand-700">{label}</Link>)}
          <a href={verifyUrl} target="_blank" rel="noreferrer" className="btn-primary !px-4 !py-2 text-sm"><ShieldCheck size={16}/> Verify Certificate</a>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden">{open ? <X/> : <Menu/>}</button>
      </div>
      {open && <div className="border-t bg-white p-4 md:hidden">
        <div className="flex flex-col gap-3">
          {links.map(([label, href]) => <Link onClick={() => setOpen(false)} key={label} href={href} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-50">{label}</Link>)}
          <a href={verifyUrl} target="_blank" rel="noreferrer" className="btn-primary"><ShieldCheck size={16}/> Verify Certificate</a>
        </div>
      </div>}
    </header>
  );
}
