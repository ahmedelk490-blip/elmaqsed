import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import AdminNav from "@/app/admin/AdminNav";
import { collections } from "@/lib/admin";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const links = [
  { href: "/admin", label: "لوحة التحكم" },
  { href: "/admin/bookings", label: "الحجوزات" },
  { href: "/admin/contacts", label: "الاتصالات" },
  { href: "/admin/single/site", label: "إعدادات الموقع" },
  { href: "/admin/single/about", label: "صفحة من نحن" },
  ...Object.entries(collections).map(([k, c]) => ({ href: `/admin/${k}`, label: c.label })),
  { href: "/admin/account", label: "المستخدمون والحساب" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthed())) redirect("/admin/login");
  return (
    <div className="admin min-h-screen bg-[#f3f5f9] text-navy md:flex">
      <AdminNav links={links} />
      <main className="min-w-0 flex-1 p-4 sm:p-5 md:p-10">{children}</main>
    </div>
  );
}
