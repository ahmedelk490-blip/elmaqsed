import { currentUser, getUsers, requireAdmin } from "@/lib/auth";
import { deleteUser } from "@/lib/actions";
import { AccountForm, AddUserForm } from "@/app/admin/forms";

export default async function AccountPage() {
  await requireAdmin();
  const [me, users] = await Promise.all([currentUser(), getUsers()]);
  return (
    <div className="grid max-w-5xl gap-8 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-bold">حسابي</h1>
        <p className="mt-1 text-sm text-slate-500">غيّر اسم المستخدم أو كلمة المرور. بعد الحفظ تخرج أجهزتك الأخرى من اللوحة تلقائياً.</p>
        <AccountForm user={me?.user ?? ""} />
      </div>
      <div>
        <h2 className="text-2xl font-bold">المستخدمون</h2>
        <p className="mt-1 text-sm text-slate-500">كل من يمكنه الدخول إلى لوحة التحكم. حذف مستخدم يخرجه من اللوحة فوراً.</p>
        <ul className="a-card mt-6 divide-y divide-slate-100 p-0">
          {users.map((u) => (
            <li key={u.user} className="flex items-center justify-between gap-3 p-4">
              <span className="min-w-0 truncate font-semibold" dir="ltr">{u.user}</span>
              {u.user === me?.user
                ? <span className="shrink-0 rounded-full bg-[#e0f2fe] px-2.5 py-1 text-xs font-bold text-[#075985]">أنت</span>
                : <form action={deleteUser.bind(null, u.user)}><button className="a-btn a-btn-danger">حذف</button></form>}
            </li>
          ))}
        </ul>
        <AddUserForm />
      </div>
    </div>
  );
}
