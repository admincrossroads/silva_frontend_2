"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  activityRequestApi,
  type ActivityRequestType,
} from "@/lib/api/activity-requests";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/select-native";

const REQUEST_TYPES: { value: ActivityRequestType; label: string }[] = [
  { value: "coffee_testing", label: "Coffee testing / cupping" },
  { value: "farm_status_assessment", label: "Farm status assessment" },
  { value: "soil_analysis", label: "Soil analysis" },
  { value: "quality_audit", label: "Quality audit" },
  { value: "infrastructure_inspection", label: "Infrastructure inspection" },
];

export default function NewActivityRequestPage() {
  const router = useRouter();
  const [requestType, setRequestType] = useState<ActivityRequestType>("coffee_testing");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [blocksOrAreas, setBlocksOrAreas] = useState("");
  const [error, setError] = useState("");

  const create = useMutation({
    mutationFn: () =>
      activityRequestApi.create({
        requestType,
        title,
        description,
        urgency,
        blocksOrAreas: blocksOrAreas || undefined,
      }),
    onSuccess: () => router.push("/planning/requests"),
    onError: (err) => setError(getApiErrorMessage(err, "Could not submit request")),
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Request activity</h1>
        <p className="text-sm text-muted-foreground">
          Ad-hoc Silva ask — does not need to match the annual plan. SPX Planner will triage and
          convert to an AFE if approved.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Request details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NativeSelect
            label="Activity type"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as ActivityRequestType)}
          >
            {REQUEST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </NativeSelect>
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What should SPX arrange, where, and why now?"
          />
          <NativeSelect label="Urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </NativeSelect>
          <Input
            label="Blocks / areas (optional)"
            value={blocksOrAreas}
            onChange={(e) => setBlocksOrAreas(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              disabled={create.isPending || !title.trim() || !description.trim()}
              onClick={() => create.mutate()}
            >
              Submit to SPX Planner
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
