"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  servicesProvided: z.string().min(1, "Required"),
  prequalified: z.boolean().default(false),
  insuranceOnFile: z.boolean().default(false),
  insuranceExpiry: z.string().optional(),
  isDefaultExecutionPartner: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

interface VendorFormProps {
  onSubmit: (data: FormValues) => void;
  isPending?: boolean;
  defaultValues?: Partial<FormValues>;
}

export function VendorForm({ onSubmit, isPending, defaultValues }: VendorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="name"
        label="Vendor Name"
        placeholder="Enter vendor name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Select
        id="category"
        label="Category"
        error={errors.category?.message}
        {...register("category")}
      >
        <option value="">Select category</option>
        <option value="nursery">Nursery</option>
        <option value="planting">Planting</option>
        <option value="maintenance">Maintenance</option>
        <option value="harvesting">Harvesting</option>
        <option value="processing">Processing</option>
        <option value="transport">Transport</option>
        <option value="general">General</option>
      </Select>
      <Textarea
        id="servicesProvided"
        label="Services Provided"
        placeholder="Describe services..."
        error={errors.servicesProvided?.message}
        {...register("servicesProvided")}
      />
      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded border-input" {...register("prequalified")} />
          <span className="text-sm font-medium text-foreground">Prequalified</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded border-input" {...register("insuranceOnFile")} />
          <span className="text-sm font-medium text-foreground">Insurance on File</span>
        </label>
        <Input
          id="insuranceExpiry"
          label="Insurance Expiry"
          type="date"
          {...register("insuranceExpiry")}
        />
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded border-input" {...register("isDefaultExecutionPartner")} />
          <span className="text-sm font-medium text-foreground">Default Execution Partner</span>
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Vendor"}
        </Button>
      </div>
    </form>
  );
}
