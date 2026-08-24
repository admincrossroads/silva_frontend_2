export type ItemType =
  | "afp"
  | "afe"
  | "work_order"
  | "field_ticket"
  | "payment_request"
  | "settlement"
  | "vendor"
  | "bva";

export interface ActivityEntry {
  id: string;
  timestamp: string;
  type: "status_change" | "field_edit" | "comment" | "validation";
  userId: string;
  userName: string;
  oldState?: unknown;
  newState?: unknown;
  comment?: string;
}

export interface ItemComment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: string;
  mentions: string[];
}

export interface ItemAttachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageKey: string;
  uploadedByUserId: string;
  createdAt: string;
}

/** Universal list/board card payload — maps any instrument row to Procore-style Item UI */
export interface BoardItem {
  id: string;
  type: ItemType;
  status: string;
  title: string;
  subtitle?: string;
  href: string;
  meta?: { label: string; value: string }[];
  assignee?: string;
  updatedAt?: string;
  badge?: string;
}

export interface Item {
  id: string;
  type: ItemType;
  status: string;
  fields: Record<string, unknown>;
  activityFeed: ActivityEntry[];
  comments: ItemComment[];
  attachments: ItemAttachment[];
}
