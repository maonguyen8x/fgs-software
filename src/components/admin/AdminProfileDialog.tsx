"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarImageEditor } from "./AvatarImageEditor";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";

interface AdminProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

interface ProfileData {
  email: string;
  name: string;
  avatar: string | null;
}

export function AdminProfileDialog({ open, onClose, onSaved }: AdminProfileDialogProps) {
  const t = useTranslations("admin.profile");
  const { update: updateSession } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void fetch("/api/admin/profile")
      .then((res) => res.json())
      .then((data: ProfileData) => {
        setProfile(data);
        setName(data.name);
        setAvatar(data.avatar ?? "");
      })
      .catch(() => showAdminErrorToast(t("load_failed")))
      .finally(() => setLoading(false));
  }, [open, t]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), avatar: avatar || undefined }),
    });
    setSaving(false);
    if (!res.ok) {
      showAdminErrorToast(t("save_failed"));
      return;
    }
    const updated = (await res.json()) as ProfileData;
    setProfile(updated);
    setAvatar(updated.avatar ?? "");
    await updateSession({
      name: updated.name,
      image: updated.avatar ?? undefined,
    });
    showAdminSuccessToast(t("save_success"));
    onSaved?.();
    router.refresh();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 pt-[8vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
          onClick={onClose}
          aria-label={t("close")}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="max-h-[min(80vh,640px)] overflow-y-auto p-6 pt-10">
          <h2 className="text-xl font-bold text-slate-900">{t("title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : profile ? (
            <div className="mt-6 space-y-4">
              <div>
                <Label>{t("display_name")}</Label>
                <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>{t("email")}</Label>
                <Input className="mt-1 bg-slate-50" value={profile.email} disabled readOnly />
              </div>
              <div>
                <Label>{t("username")}</Label>
                <Input className="mt-1 bg-slate-50" value={profile.email} disabled readOnly />
              </div>
              <div>
                <Label>{t("avatar")}</Label>
                <div className="mt-2">
                  <AvatarImageEditor value={avatar} onChange={setAvatar} />
                </div>
              </div>
              <Button
                type="button"
                className="w-full cursor-pointer gap-1"
                disabled={saving || !name.trim()}
                onClick={() => void handleSave()}
              >
                <Save className="h-4 w-4" />
                {saving ? t("saving") : t("save")}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
