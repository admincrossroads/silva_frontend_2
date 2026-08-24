"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect as Select } from "@/components/ui/select-native";
import {
  RegistrationHeader,
  RegistrationMobileProgress,
  RegistrationStepSidebar,
  type RegistrationStep,
} from "@/components/auth/registration-shell";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useSubmitRegistration } from "@/hooks/use-registration";
import type { RegistrationOrgType, RegistrationSubmitDto } from "@/lib/api/registration";

type FormState = RegistrationSubmitDto;

const emptyForm = (orgType: RegistrationOrgType): FormState => ({
  orgType,
  orgName: "",
  orgSlug: "",
  displayName: "",
  legalName: "",
  country: "Ethiopia",
  region: "",
  address: "",
  website: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  contactTitle: "",
  assetInterests: "",
  governanceNotes: "",
  vendorCategory: "Agronomic Operations",
  servicesProvided: "",
  insuranceOnFile: false,
  fieldCapacity: "",
});

function stepsFor(orgType: RegistrationOrgType): RegistrationStep[] {
  const profileDesc =
    orgType === "silva" ? "Estates, hectares, and governance" : "Services, capacity, and insurance";
  return [
    { label: "Organization", description: "Legal entity and location" },
    { label: "Contact", description: "Primary administrator" },
    { label: "Profile", description: profileDesc },
    { label: "Review", description: "Confirm and submit" },
  ];
}

type Props = {
  orgType: RegistrationOrgType;
};

export function RegistrationWizard({ orgType }: Props) {
  const router = useRouter();
  const submit = useSubmitRegistration();
  const steps = stepsFor(orgType);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => emptyForm(orgType));
  const [error, setError] = useState("");

  const set = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const title =
    orgType === "silva"
      ? ["Your organization", "Primary contact", "Asset profile", "Review application"][step]
      : ["Your organization", "Primary contact", "Vendor profile", "Review application"][step];

  const subtitle =
    orgType === "silva"
      ? [
          "Tell us about the asset owner company applying for a governance workspace.",
          "Who should SPX contact about this application?",
          "Describe the estates and governance context SPX should know.",
          "Check everything before submitting to SPX for review.",
        ][step]
      : [
          "Tell us about the execution vendor company applying for a field workspace.",
          "Who should SPX contact about this application?",
          "Describe the services and field capacity you provide.",
          "Check everything before submitting to SPX for review.",
        ][step];

  const next = () => {
    setError("");
    if (step === 0 && !form.orgName.trim()) {
      setError("Organization name is required.");
      return;
    }
    if (step === 1 && (!form.contactName.trim() || !form.contactEmail.trim())) {
      setError("Contact name and email are required.");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setError("");
    try {
      const payload: RegistrationSubmitDto = {
        ...form,
        orgSlug: form.orgSlug?.trim() || undefined,
        displayName: form.displayName?.trim() || undefined,
        legalName: form.legalName?.trim() || undefined,
        estimatedHectares: form.estimatedHectares ? Number(form.estimatedHectares) : undefined,
      };
      await submit.mutateAsync(payload);
      router.push(`/register/submitted?type=${orgType === "silva" ? "asset-owner" : "vendor"}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not submit registration."));
    }
  };

  const typeLabel = orgType === "silva" ? "Asset owner" : "Execution vendor";

  return (
    <>
      <RegistrationHeader
        right={
          <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">
            Change type
          </Link>
        }
      />
      <RegistrationMobileProgress steps={steps} currentStep={step} />

      <div className="flex flex-1">
        <RegistrationStepSidebar steps={steps} currentStep={step} />

        <div className="flex min-h-0 flex-1 flex-col">
          <main className="flex-1 px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
            <div className="mx-auto max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">{typeLabel} application</p>
              <h1 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">{title}</h1>
              <p className="mt-3 text-base leading-relaxed text-[hsl(160_12%_38%)]">{subtitle}</p>

              {error ? (
                <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="mt-8 rounded-2xl border border-[hsl(150_14%_86%)] bg-white p-6 shadow-sm sm:p-8">
                {step === 0 ? (
                  <div className="space-y-5">
                    <Input id="orgName" label="Organization name" value={form.orgName} onChange={(e) => set({ orgName: e.target.value })} required />
                    <Input id="legalName" label="Legal entity name" value={form.legalName || ""} onChange={(e) => set({ legalName: e.target.value })} />
                    <Input id="displayName" label="Display name" value={form.displayName || ""} onChange={(e) => set({ displayName: e.target.value })} />
                    <Input id="orgSlug" label="Workspace slug (optional)" placeholder="my-estate" value={form.orgSlug || ""} onChange={(e) => set({ orgSlug: e.target.value })} />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input id="country" label="Country" value={form.country || ""} onChange={(e) => set({ country: e.target.value })} />
                      <Input id="region" label="Region / zone" value={form.region || ""} onChange={(e) => set({ region: e.target.value })} />
                    </div>
                    <Input id="address" label="Address" value={form.address || ""} onChange={(e) => set({ address: e.target.value })} />
                    <Input id="website" label="Website" value={form.website || ""} onChange={(e) => set({ website: e.target.value })} />
                  </div>
                ) : null}

                {step === 1 ? (
                  <div className="space-y-5">
                    <Input id="contactName" label="Primary contact name" value={form.contactName} onChange={(e) => set({ contactName: e.target.value })} required />
                    <Input id="contactTitle" label="Job title" value={form.contactTitle || ""} onChange={(e) => set({ contactTitle: e.target.value })} />
                    <Input id="contactEmail" label="Work email" type="email" value={form.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} required />
                    <Input id="contactPhone" label="Phone" value={form.contactPhone || ""} onChange={(e) => set({ contactPhone: e.target.value })} />
                  </div>
                ) : null}

                {step === 2 && orgType === "silva" ? (
                  <div className="space-y-5">
                    <Textarea id="assetInterests" label="Asset interests" value={form.assetInterests || ""} onChange={(e) => set({ assetInterests: e.target.value })} placeholder="Estates, regions, crop focus, turnaround goals…" />
                    <Input id="estimatedHectares" label="Estimated hectares under interest" type="number" step="0.01" min="0" value={form.estimatedHectares?.toString() || ""} onChange={(e) => set({ estimatedHectares: e.target.value ? Number(e.target.value) : undefined })} />
                    <Textarea id="governanceNotes" label="Governance / approval requirements" value={form.governanceNotes || ""} onChange={(e) => set({ governanceNotes: e.target.value })} />
                  </div>
                ) : null}

                {step === 2 && orgType === "vendor" ? (
                  <div className="space-y-5">
                    <Select id="vendorCategory" label="Primary category" value={form.vendorCategory || ""} onChange={(e) => set({ vendorCategory: e.target.value })}>
                      <option value="Agronomic Operations">Agronomic Operations</option>
                      <option value="Harvest & Post-Harvest">Harvest & Post-Harvest</option>
                      <option value="Nursery & Propagation">Nursery & Propagation</option>
                      <option value="General Field Operations">General Field Operations</option>
                    </Select>
                    <Textarea id="servicesProvided" label="Services provided" value={form.servicesProvided || ""} onChange={(e) => set({ servicesProvided: e.target.value })} placeholder="Nursery, infilling, harvest supervision…" />
                    <Input id="fieldCapacity" label="Field capacity / coverage" value={form.fieldCapacity || ""} onChange={(e) => set({ fieldCapacity: e.target.value })} placeholder="Teams, hectares, regions served" />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={Boolean(form.insuranceOnFile)} onChange={(e) => set({ insuranceOnFile: e.target.checked })} />
                      Insurance documentation available on request
                    </label>
                  </div>
                ) : null}

                {step === 3 ? (
                  <dl className="space-y-4 text-sm">
                    <ReviewRow label="Organization" value={form.orgName} />
                    {form.legalName ? <ReviewRow label="Legal name" value={form.legalName} /> : null}
                    <ReviewRow label="Type" value={typeLabel} />
                    <ReviewRow label="Contact" value={`${form.contactName} · ${form.contactEmail}`} />
                    {form.contactPhone ? <ReviewRow label="Phone" value={form.contactPhone} /> : null}
                    {orgType === "silva" && form.assetInterests ? <ReviewRow label="Assets" value={form.assetInterests} /> : null}
                    {orgType === "vendor" && form.servicesProvided ? <ReviewRow label="Services" value={form.servicesProvided} /> : null}
                    <p className="border-t pt-4 text-xs leading-relaxed text-muted-foreground">
                      By submitting, you request access to Coffee Field OS. SPX will contact you before activating your workspace.
                    </p>
                  </dl>
                ) : null}
              </div>
            </div>
          </main>

          <footer className="sticky bottom-0 border-t border-[hsl(150_14%_86%)] bg-white/95 px-5 py-4 backdrop-blur-sm sm:px-8 lg:px-12">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
              {step === 0 ? (
                <Button type="button" variant="outline" asChild>
                  <Link href="/register">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={back}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              {step < steps.length - 1 ? (
                <Button type="button" onClick={next}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" disabled={submit.isPending} onClick={handleSubmit}>
                  {submit.isPending ? "Submitting…" : "Submit application"}
                </Button>
              )}
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium sm:text-right">{value}</dd>
    </div>
  );
}
