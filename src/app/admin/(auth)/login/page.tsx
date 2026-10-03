import { redirect } from "next/navigation";
import { getCreds, isAuthed } from "@/lib/auth";
import { LoginForm } from "@/app/admin/forms";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!(await getCreds())) redirect("/admin/setup");
  if (await isAuthed()) redirect("/admin");
  return <div className="grid min-h-screen place-items-center p-6"><LoginForm /></div>;
}
