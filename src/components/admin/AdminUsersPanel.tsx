"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { ADMIN_ROLE, SUPER_ADMIN_ROLE } from "@/lib/admin-roles";
import { Plus, Pencil, Trash2, Shield, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const emptyForm: {
  email: string;
  name: string;
  password: string;
  role: string;
  isActive: boolean;
} = {
  email: "",
  name: "",
  password: "",
  role: ADMIN_ROLE,
  isActive: true,
};

export function AdminUsersPanel() {
  const t = useTranslations("admin.users");
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const data = (await res.json()) as { users?: AdminUserRow[] };
    setUsers(data.users ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (user: AdminUserRow) => {
    setEditingId(user.id);
    setForm({
      email: user.email,
      name: user.name,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const isEdit = Boolean(editingId);
    const url = isEdit ? `/api/admin/users/${editingId}` : "/api/admin/users";
    const method = isEdit ? "PATCH" : "POST";

    const payload: Record<string, unknown> = {
      email: form.email.trim(),
      name: form.name.trim(),
      role: form.role,
      isActive: form.isActive,
    };
    if (form.password.trim()) payload.password = form.password;
    if (!isEdit && !form.password.trim()) {
      showAdminErrorToast(t("password_required"));
      setLoading(false);
      return;
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      showAdminErrorToast(data.error ?? t("save_failed"));
      return;
    }
    showAdminSuccessToast(isEdit ? t("update_success") : t("create_success"));
    resetForm();
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("delete_confirm"))) return;
    setLoading(true);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      showAdminErrorToast(data.error ?? t("delete_failed"));
      return;
    }
    showAdminSuccessToast(t("delete_success"));
    await load();
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-primary-800">{t("title")}</h2>
          <p className="text-sm text-slate-500">{t("subtitle")}</p>
        </div>
        <Button type="button" size="sm" className="cursor-pointer" onClick={startCreate}>
          <Plus className="mr-1 h-4 w-4" />
          {t("add")}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">
            {editingId ? t("edit_title") : t("create_title")}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>{t("email")}</Label>
              <Input className="mt-1" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <Label>{t("name")}</Label>
              <Input className="mt-1" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>{editingId ? t("password_optional") : t("password")}</Label>
              <Input
                type="password"
                className="mt-1"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div>
              <Label>{t("role")}</Label>
              <AdminSelect className="mt-1" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option value={ADMIN_ROLE}>{t("role_admin")}</option>
                <option value={SUPER_ADMIN_ROLE}>{t("role_super")}</option>
              </AdminSelect>
            </div>
            {editingId && (
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded border-slate-300"
                  />
                  {t("active")}
                </label>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" className="cursor-pointer" onClick={() => void handleSave()} disabled={loading}>
              {loading ? t("saving") : t("save")}
            </Button>
            <Button type="button" variant="outline" className="cursor-pointer" onClick={resetForm}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3">{t("name")}</th>
              <th className="px-4 py-3">{t("email")}</th>
              <th className="px-4 py-3">{t("role")}</th>
              <th className="px-4 py-3">{t("status")}</th>
              <th className="px-4 py-3">{t("last_login")}</th>
              <th className="px-4 py-3 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{user.name}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                      user.role === SUPER_ADMIN_ROLE
                        ? "bg-violet-100 text-violet-800"
                        : "bg-slate-100 text-slate-700"
                    )}
                  >
                    {user.role === SUPER_ADMIN_ROLE ? <Shield className="h-3 w-3" /> : <UserCog className="h-3 w-3" />}
                    {user.role === SUPER_ADMIN_ROLE ? t("role_super") : t("role_admin")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      user.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    )}
                  >
                    {user.isActive ? t("active") : t("disabled")}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(user.lastLoginAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button type="button" size="sm" variant="ghost" className="cursor-pointer" onClick={() => startEdit(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="cursor-pointer text-red-600 hover:text-red-700"
                      onClick={() => void handleDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-500">{t("empty")}</p>}
      </div>
    </div>
  );
}
