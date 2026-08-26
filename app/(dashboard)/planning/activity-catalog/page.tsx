"use client";

import { useQuery } from "@tanstack/react-query";
import { activityCatalogApi } from "@/lib/api/activity-catalog";
import { Card } from "@/components/ui/card";

export default function ActivityCatalogPage() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["activity-catalog-all"],
    queryFn: () => activityCatalogApi.list({}),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity catalog</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Field activity norms — populated when SPX accepts an annual work plan.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-2 font-medium">Code</th>
                <th className="px-4 py-2 font-medium">Section</th>
                <th className="px-4 py-2 font-medium">Activity</th>
                <th className="px-4 py-2 font-medium">Unit</th>
                <th className="px-4 py-2 font-medium text-right">MD/unit</th>
                <th className="px-4 py-2 font-medium text-right">Wage ETB</th>
                <th className="px-4 py-2 font-medium text-right">Annual ETB</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Loading catalog…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No activities yet. Accept a work plan (SPX) to populate the catalog.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-2 font-mono text-xs">{row.id}</td>
                    <td className="px-4 py-2 text-muted-foreground">{row.sectionLabel}</td>
                    <td className="px-4 py-2">{row.nameEn}</td>
                    <td className="px-4 py-2">{row.unit}</td>
                    <td className="px-4 py-2 text-right">{row.normMdPerUnit ?? "—"}</td>
                    <td className="px-4 py-2 text-right">{row.normWageEtb?.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-2 text-right">{row.annualCostEtb?.toLocaleString() ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
