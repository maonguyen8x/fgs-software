import { CoreValueForm } from "@/components/admin/CoreValueForm";

export default function NewCoreValuePage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Add Core Value</h1>
      <CoreValueForm />
    </div>
  );
}
