import { FounderForm } from "@/components/admin/FounderForm";

export default function NewFounderPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Add Founder</h1>
      <FounderForm />
    </div>
  );
}
