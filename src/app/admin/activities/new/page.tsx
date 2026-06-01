import { ActivityForm } from "@/components/admin/ActivityForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function NewActivityPage() {
  return (
    <div className="p-8">
      <AdminPageHeader title="New Activity" backHref="/admin/activities" />
      <ActivityForm />
    </div>
  );
}
