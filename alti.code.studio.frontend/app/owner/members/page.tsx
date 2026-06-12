import { redirect } from "next/navigation";

export default function RedirectToTeamMembers() {
  redirect("/owner/team-members");
}
