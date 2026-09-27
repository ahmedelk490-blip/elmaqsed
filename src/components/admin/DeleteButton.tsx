"use client";

export default function DeleteButton() {
  return (
    <button className="a-btn a-btn-danger" onClick={(e) => { if (!confirm("حذف نهائي؟ لا يمكن التراجع.")) e.preventDefault(); }}>
      حذف
    </button>
  );
}
