import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RegistrationWizard } from "@/components/auth/registration-wizard";
import { Button } from "@/components/ui/button";

export default function NewAssetOwnerRegistrationPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link href="/settings/registrations/new">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change type
        </Link>
      </Button>
      <RegistrationWizard orgType="silva" internal />
    </div>
  );
}
