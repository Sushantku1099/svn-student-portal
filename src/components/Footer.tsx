"use client";
import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function Footer() {
  const [verifyUrl, setVerifyUrl] = useState("#");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then((r) => r.json())
      .then((j) => setVerifyUrl(j.data?.certificateVerifyUrl || "#"))
      .catch(() => {});
  }, []);
  return (
    <footer id="contact" className="mt-20 bg-slate-950 text-white">
      <div className="container-pad grid gap-10 py-14 md:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-3 font-extrabold">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-600">
              <Sun />
            </span>
            SVN Infra & Solar Service Pvt Ltd
          </div>
          <p className="text-sm leading-6 text-slate-300">
            Professional student registration and certificate verification
            portal. Developed By: Sushant Sagar
          </p>
        </div>
        <div className="space-y-3 text-sm text-slate-300">
          <h3 className="font-bold text-white">Contact</h3>
          <p className="flex gap-2">
            <Phone size={16} /> +91-6207504908
          </p>
          <p className="flex gap-2">
            <Mail size={16} /> sushantku1099@gmail.com
          </p>
          <p className="flex gap-2">
            <MapPin size={16} /> Banka, Bihar, India
          </p>
        </div>
        <div className="space-y-3">
          <h3 className="font-bold">Quick Links</h3>
          <Link
            className="block text-slate-300 hover:text-white"
            href="/register"
          >
            Student Registration
          </Link>
          <Link
            className="block text-slate-300 hover:text-white"
            href="/status"
          >
            Check Status
          </Link>
          {mounted && (
            <a
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white"
              href={verifyUrl}
              target="_blank"
            >
              <ShieldCheck size={16} /> Verify Certificate
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} SVN Infra & Solar Service Pvt Ltd. All
        rights reserved.
      </div>
    </footer>
  );
}
