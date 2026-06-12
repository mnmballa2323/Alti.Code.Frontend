import { redirect } from "next/navigation";

export default function PlatformAdminPage() {
  redirect("/owner/members");
}
