import { redirect } from "next/navigation";
import { getCreds } from "@/lib/auth";
import { SetupForm } from "@/app/admin/forms";

export const dynamic = "force-dynamic";

/** Open only until the admin account exists; after that it always sends the visitor to the login page. */
export default async function SetupPage() {
  if (await getCreds()) redirect("/admin/login");
  return <div className="grid min-h-screen place-items-center p-6"><SetupForm /></div>;
}
