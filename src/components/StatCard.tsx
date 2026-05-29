import { LucideIcon } from 'lucide-react';
export default function StatCard({ title, value, icon: Icon, color='bg-brand-600' }: { title: string; value: number | string; icon: LucideIcon; color?: string }) {
  return <div className="card p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-500">{title}</p><p className="mt-2 text-3xl font-extrabold">{value}</p></div><div className={`grid h-12 w-12 place-items-center rounded-2xl ${color} text-white`}><Icon/></div></div></div>;
}
