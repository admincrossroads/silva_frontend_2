"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkPlanSectionEditor } from "@/components/work-plan/work-plan-section-editor";
import {
  buildParsedFromSections,
  initSectionsFromTemplate,
  sectionTotals,
  type ParsedWorkPlan,
  type WorkPlanSectionDraft,
  type WorkPlanTemplate,
} from "@/lib/work-plan/builder";

type Props = {
  template: WorkPlanTemplate;
  parsed: ParsedWorkPlan | null;
  fx: number;
  farmBlocks?: string[];
  readOnly?: boolean;
  onSave: (parsed: ParsedWorkPlan) => void;
  isSaving?: boolean;
};

export function WorkPlanBuilder({ template, parsed, fx, farmBlocks, readOnly, onSave, isSaving }: Props) {
  const [sections, setSections] = useState<WorkPlanSectionDraft[]>(() =>
    initSectionsFromTemplate(template, parsed),
  );
  const [activeTab, setActiveTab] = useState(template.sections[0]?.sectionCode || "nursery");

  const grandTotal = useMemo(
    () =>
      sections
        .filter((s) => s.enabled)
        .reduce((sum, s) => sum + sectionTotals(s).costEtb, 0),
    [sections],
  );

  const updateSection = (sectionCode: string, next: WorkPlanSectionDraft) => {
    setSections((prev) => prev.map((s) => (s.sectionCode === sectionCode ? next : s)));
  };

  const blockCodes = farmBlocks?.length ? farmBlocks : template.farmBlocks;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-5 py-4">
        <h2 className="text-sm font-semibold">Build annual plan</h2>
        <p className="text-lg font-semibold tabular-nums">{grandTotal.toLocaleString()} ETB</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-5">
        <TabsList className="mb-4 h-auto flex-wrap justify-start gap-1">
          {sections.map((s) => {
            const t = sectionTotals(s);
            return (
              <TabsTrigger key={s.sectionCode} value={s.sectionCode} className="text-xs sm:text-sm">
                {s.sectionCode === "salary" ? "Payroll" : s.sectionLabel.replace(/^[IVX]+\.\s*/, "").slice(0, 22)}
                {s.enabled && t.costEtb > 0 ? (
                  <span className="ml-1 text-muted-foreground">({Math.round(t.costEtb / 1000)}k)</span>
                ) : null}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.sectionCode} value={section.sectionCode}>
            <WorkPlanSectionEditor
              section={section}
              farmBlocks={blockCodes}
              readOnly={readOnly}
              onChange={(next) => updateSection(section.sectionCode, next)}
            />
          </TabsContent>
        ))}
      </Tabs>

      {!readOnly ? (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t px-5 py-4">
          <Button
            disabled={isSaving || grandTotal <= 0}
            onClick={() => onSave(buildParsedFromSections(sections, fx, "form"))}
          >
            {isSaving ? "Saving…" : "Save plan draft"}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
