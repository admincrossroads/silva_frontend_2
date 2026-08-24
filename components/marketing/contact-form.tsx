"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useSubmitContact } from "@/hooks/use-contact";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  organization: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Please add a bit more detail").max(5000),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const submit = useSubmitContact();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await submit.mutateAsync({
        name: data.name.trim(),
        email: data.email.trim(),
        organization: data.organization?.trim() || undefined,
        subject: data.subject.trim(),
        message: data.message.trim(),
      });
      setSent(true);
      reset();
    } catch {
      /* error shown below */
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-[hsl(150_14%_86%)] bg-white p-8 text-center shadow-[0_12px_40px_-24px_rgba(20,50,40,0.35)]">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-4 font-display text-2xl text-[hsl(160_28%_14%)]">Message sent</h3>
        <p className="mt-2 text-sm leading-relaxed text-[hsl(160_12%_40%)]">
          Thanks for reaching out. The platform team will follow up by email.
        </p>
        <Button type="button" variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-[hsl(150_14%_86%)] bg-white p-6 shadow-[0_12px_40px_-24px_rgba(20,50,40,0.35)] sm:p-8"
    >
      {submit.isError ? (
        <p className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {getApiErrorMessage(submit.error, "Could not send your message. Please try again.")}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="contactName" label="Name" {...register("name")} error={errors.name?.message} required />
        <Input
          id="contactEmail"
          label="Email"
          type="email"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
          required
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          id="contactOrganization"
          label="Organization (optional)"
          {...register("organization")}
          error={errors.organization?.message}
        />
        <Input
          id="contactSubject"
          label="Subject"
          {...register("subject")}
          error={errors.subject?.message}
          required
        />
      </div>

      <div className="mt-4">
        <Textarea
          id="contactMessage"
          label="Message"
          rows={5}
          placeholder="Tell us about your estate, partnership interest, or question…"
          {...register("message")}
          error={errors.message?.message}
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting || submit.isPending} className="mt-6 h-11 w-full sm:w-auto">
        {isSubmitting || submit.isPending ? "Sending…" : (
          <span className="inline-flex items-center gap-2">
            Send message
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </form>
  );
}
