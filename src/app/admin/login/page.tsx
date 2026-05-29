'use client';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { Lock, Sun } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true);
    try { const res = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, password }) }); const json = await res.json(); if(!res.ok) throw new Error(json.message); toast.success('Login successful'); location.href='/admin/dashboard'; }
    catch(e:any){ toast.error(e.message || 'Login failed'); } finally { setLoading(false); }
  }
  return <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-950 via-brand-900 to-slate-900 p-4"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"><Link href="/" className="mb-6 flex items-center gap-3 font-black"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white"><Sun/></span>SVN Admin Portal</Link><div className="mb-6"><Lock className="text-brand-600"/><h1 className="mt-3 text-3xl font-black">Admin Login</h1><p className="mt-2 text-sm text-slate-500">Secure JWT protected dashboard.</p></div><label className="label">Username</label><input className="input" value={username} onChange={e=>setUsername(e.target.value)} required/><label className="label mt-4">Password</label><input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} required/><button disabled={loading} className="btn-primary mt-6 w-full">{loading ? 'Signing in...' : 'Login'}</button><Link href="/" className="mt-4 block text-center text-sm font-semibold text-slate-500 hover:text-brand-700">Back to website</Link></form></main>;
}
