import Link from "next/link";
import { Building2, Tractor, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NewRegistrationPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings/registrations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to registrations
          </Link>
        </Button>
      </div>

      <h2 className="text-lg font-semibold">New registration</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/settings/registrations/new/asset-owner" className="group block">
          <Card className="h-full transition hover:border-primary/30 hover:shadow-md">
            <CardContent className="flex h-full flex-col p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">Asset owner</h3>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                Start intake
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings/registrations/new/vendor" className="group block">
          <Card className="h-full transition hover:border-primary/30 hover:shadow-md">
            <CardContent className="flex h-full flex-col p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Tractor className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">Execution vendor</h3>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                Start intake
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
