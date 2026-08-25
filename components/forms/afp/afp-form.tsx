"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAfp } from "@/hooks/use-afps";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const DISCIPLINES = [
  "Agronomy",
  "Processing",
  "Capping",
  "Infrastructure",
  "Environment",
  "Social",
  "Harvest",
  "General Admin",
  "Agronomic Operations",
  "Other",
];

const ACTIVITY_SUGGESTIONS = [
  "Capping",
  "Processing",
  "Pruning",
  "Fertilization",
  "Irrigation",
  "Pest control",
  "Harvest",
  "Packing",
  "Transport",
  "Infrastructure maintenance",
];

const afpSchema = z.object({
  year: z.coerce.number().min(2020).max(2100),
  operatingDiscipline: z.string().min(1, "Required"),
  activity: z.string().min(1, "Required"),
  budgetAllocatedUsd: z.coerce.number().positive("Must be positive"),
  kpiTarget: z.string().min(1, "Required"),
  notes: z.string().optional(),
});

type AfpFormValues = z.infer<typeof afpSchema>;

interface AfpFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<AfpFormValues>;
}

export function AfpForm({ onSuccess, defaultValues }: AfpFormProps) {
  const createAfp = useCreateAfp();
  const [error, setError] = useState("");

  const form = useForm<AfpFormValues>({
    resolver: zodResolver(afpSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      operatingDiscipline: "",
      activity: "",
      budgetAllocatedUsd: 0,
      kpiTarget: "",
      notes: "",
      ...defaultValues,
    },
  });

  async function onSubmit(values: AfpFormValues) {
    setError("");
    try {
      await createAfp.mutateAsync(values as Record<string, unknown>);
      onSuccess?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create AFP line"));
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {/* Add a budget line for a specific task — capping, processing, or any other activity. */}
        </p>
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="operatingDiscipline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operating Discipline</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DISCIPLINES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity / task</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  list="afp-activity-suggestions"
                  placeholder="e.g. Capping, Processing, Pruning…"
                />
              </FormControl>
              <datalist id="afp-activity-suggestions">
                {ACTIVITY_SUGGESTIONS.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budgetAllocatedUsd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Allocated (USD)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kpiTarget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KPI Target</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. 120 ha capped" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Optional scope or site notes" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createAfp.isPending} className="w-full">
          {createAfp.isPending ? "Creating..." : "Create AFP line"}
        </Button>
      </form>
    </Form>
  );
}
