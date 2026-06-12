import { redirect } from "next/navigation";

export default function OwnerIndexPage() {
  redirect("/owner/team-members");
}
