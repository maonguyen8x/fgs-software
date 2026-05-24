import { BranchForm } from "@/components/admin/BranchForm";

export default function NewBranchPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Add Branch</h1>
      <BranchForm />
    </div>
  );
}
