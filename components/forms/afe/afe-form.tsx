"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAfe } from "@/hooks/use-afes";
import { useAfps } from "@/hooks/use-afps";
import { useSchedule3 } from "@/hooks/use-schedule3";
import { computeBandFromThresholds } from "@/lib/utils/compute-band";
import { BandBadge } from "@/components/badges/band-badge";
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
  "Infrastructure",
  "Environment",
  "Social",
  "General Admin",
];

import type { Schedule3Threshold } from "@/types";

function computeBand(cost: number, thresholds: Schedule3Threshold[] | undefined): string {
  if (!thresholds?.length) return "—";
  return computeBandFromThresholds(cost, thresholds);
}

const afeSchema = z.object({
  afpLineId: z.string().min(1, "Required"),
  operatingDiscipline: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  estimatedCostEtb: z.coerce.number().positive("Must be positive"),
});

type AfeFormValues = z.infer<typeof afeSchema>;

interface AfeFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<AfeFormValues>;
}

export function AfeForm({ onSuccess, defaultValues }: AfeFormProps) {
  const createAfe = useCreateAfe();
  const { data: afps } = useAfps();
  const { data: schedule3 = [] } = useSchedule3();

  const form = useForm<AfeFormValues>({
    resolver: zodResolver(afeSchema),
    defaultValues: {
      afpLineId: "",
      operatingDiscipline: "",
      description: "",
      estimatedCostEtb: 0,
      ...defaultValues,
    },
  });

  const costValue = useWatch({ control: form.control, name: "estimatedCostEtb" });
  const currentBand = computeBand(Number(costValue) || 0, schedule3);

  async function onSubmit(values: AfeFormValues) {
    await createAfe.mutateAsync(values as Record<string, unknown>);
    onSuccess?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="afpLineId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AFP Line</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AFP" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {afps?.map((afp) => (
                    <SelectItem key={afp.id} value={afp.id}>
                      {afp.activity} ({afp.year})
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
          name="operatingDiscipline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operating Discipline</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimatedCostEtb"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated cost (ETB)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm text-muted-foreground">Band:</span>
                {currentBand === "—" ? (
                  <span className="text-sm text-muted-foreground">Loading thresholds…</span>
                ) : (
                  <BandBadge band={currentBand} thresholds={schedule3} />
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createAfe.isPending} className="w-full">
          {createAfe.isPending ? "Creating..." : "Create AFE"}
        </Button>
      </form>
    </Form>
  );
}
