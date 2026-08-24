const STORAGE_KEY = "cfo_offline_ft_drafts";

export type OfflineFieldTicketDraft = {
  id: string;
  workOrderId: string;
  activityRecorded: string;
  areaHa: number;
  laborCount: number;
  ticketDate: string;
  materialsUsed?: string;
  savedAt: string;
};

function readAll(): OfflineFieldTicketDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OfflineFieldTicketDraft[]) : [];
  } catch {
    return [];
  }
}

function writeAll(drafts: OfflineFieldTicketDraft[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function listOfflineFieldTicketDrafts() {
  return readAll().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function saveOfflineFieldTicketDraft(draft: Omit<OfflineFieldTicketDraft, "id" | "savedAt"> & { id?: string }) {
  const all = readAll();
  const id = draft.id ?? `offline-ft-${Date.now()}`;
  const row: OfflineFieldTicketDraft = {
    ...draft,
    id,
    savedAt: new Date().toISOString(),
  };
  const next = [row, ...all.filter((d) => d.id !== id)];
  writeAll(next);
  return row;
}

export function removeOfflineFieldTicketDraft(id: string) {
  writeAll(readAll().filter((d) => d.id !== id));
}
