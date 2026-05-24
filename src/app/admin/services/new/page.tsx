import { ServiceForm } from "@/components/admin/ServiceForm";

export default function NewServicePage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Add Service</h1>
      <ServiceForm />
    </div>
  );
}
