"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import {
  messageEntityTypesForRole,
  useMessageEntityPickerOptions,
} from "@/hooks/use-message-entity-picker";
import { notificationEntityHref } from "@/lib/notifications/entity-links";

type Props = {
  entityType: string;
  entityId: string;
  onEntityTypeChange: (type: string) => void;
  onEntityIdChange: (id: string) => void;
  /** Called when a record is picked and subject is still empty */
  onSubjectSuggest?: (subject: string) => void;
  enabled?: boolean;
  isSpx?: boolean;
  isSilva?: boolean;
  isVendor?: boolean;
};

export function MessageEntityLinkFields({
  entityType,
  entityId,
  onEntityTypeChange,
  onEntityIdChange,
  onSubjectSuggest,
  enabled = true,
  isSpx = false,
  isSilva = false,
  isVendor = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [showManualId, setShowManualId] = useState(false);

  const typeOptions = useMemo(
    () => messageEntityTypesForRole(isSpx, isSilva, isVendor),
    [isSpx, isSilva, isVendor],
  );

  const { options, isLoading, isError } = useMessageEntityPickerOptions(entityType, enabled);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) => opt.label.toLowerCase().includes(q) || opt.id.toLowerCase().includes(q),
    );
  }, [options, search]);

  const selectedOption = options.find((o) => o.id === entityId);
  const recordHref = entityType && entityId ? notificationEntityHref(entityType, entityId) : null;

  const handleTypeChange = (nextType: string) => {
    setSearch("");
    setShowManualId(false);
    onEntityTypeChange(nextType);
    onEntityIdChange("");
  };

  const handlePick = (id: string) => {
    onEntityIdChange(id);
    const picked = options.find((o) => o.id === id);
    if (picked && onSubjectSuggest) {
      onSubjectSuggest(picked.subjectHint);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Link to record (optional)
        </label>
        <Select value={entityType} onChange={(e) => handleTypeChange(e.target.value)}>
          <option value="">None</option>
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {entityType ? (
        <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
          {!showManualId ? (
            <>
              <Input
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by name, activity, or ID…"
              />
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Select record
                </label>
                <Select
                  value={entityId}
                  onChange={(e) => handlePick(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">
                    {isLoading ? "Loading…" : filteredOptions.length ? "Choose…" : "No matches"}
                  </option>
                  {entityId && !filteredOptions.some((o) => o.id === entityId) ? (
                    <option value={entityId}>
                      {selectedOption?.label ?? `Selected · ${entityId.slice(0, 8)}…`}
                    </option>
                  ) : null}
                  {filteredOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              {isError ? (
                <p className="text-xs text-destructive">Could not load records. Paste an ID below.</p>
              ) : null}
              {!isLoading && !filteredOptions.length && !entityId ? (
                <p className="text-xs text-muted-foreground">No records found for this type.</p>
              ) : null}
            </>
          ) : (
            <Input
              label="Record ID"
              value={entityId}
              onChange={(e) => onEntityIdChange(e.target.value)}
              placeholder="Paste record ID"
            />
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              className="text-primary underline-offset-2 hover:underline"
              onClick={() => setShowManualId((v) => !v)}
            >
              {showManualId ? "Pick from list" : "Paste ID instead"}
            </button>
            {recordHref ? (
              <Link
                href={recordHref}
                target="_blank"
                className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
              >
                Open record
                <ExternalLink className="h-3 w-3" />
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
