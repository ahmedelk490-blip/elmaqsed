import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { collections } from "@/lib/admin";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const links = [
  { href: "/admin", label: "لوحة التحكم" },
  { href: "/admin/bookings", label: "الحجوزات" },
  { href: "/admin/single/site", label: "إعدادات الموقع" },
  { href: "/admin/single/about", label: "صفحة من نحن" },
  ...Object.entries(collections).map(([k, c]) => ({ href: `/admin/${k}`, label: c.label })),
  { href: "/admin/account", label: "حساب الدخول" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthed())) redirect("/admin/login");
  return (
    <div className="admin flex min-h-screen bg-[#f3f5f9] text-navy">
      <aside className="hidden w-64 shrink-0 flex-col bg-navy p-5 text-white md:flex">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.svg" alt="المقصد" className="mb-8 h-9 w-auto self-start" />
        <nav className="flex flex-col gap-1 text-sm">
          {links.map((l) => <Link key={l.href} href={l.href} className="a-nav">{l.label}</Link>)}
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4 text-sm">
          <a href="/" target="_blank" className="a-nav">عرض الموقع ↗</a>
          <form action={logout}><button className="a-nav w-full text-start">تسجيل الخروج</button></form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-3 overflow-x-auto border-b border-slate-200 bg-navy px-4 py-3 text-sm text-white md:hidden">
          {links.map((l) => <Link key={l.href} href={l.href} className="shrink-0 rounded-lg px-2 py-1 hover:bg-white/10">{l.label}</Link>)}
          <form action={logout} className="mr-auto shrink-0"><button className="rounded-lg px-2 py-1 hover:bg-white/10">خروج</button></form>
        </header>
        <main className="p-5 md:p-10">{children}</main>
      </div>
    </div>
  );
}
