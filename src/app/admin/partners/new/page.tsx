import { PartnerForm } from "@/components/admin/PartnerForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function NewPartnerPage() {
  return (
    <div className="p-8">
      <AdminPageHeader title="Add Partner" backHref="/admin/partners" showHome={false} />
      <PartnerForm />
    </div>
  );
}
