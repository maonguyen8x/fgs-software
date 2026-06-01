import { redirect } from "next/navigation";

export default function AdminFoundersRedirectPage() {
  redirect("/admin/team?tab=founders");
}
