import { redirect } from "next/navigation";

export default function LegacyCoreOperationsRedirectPage() {
  redirect("/operations/interventions");
}
