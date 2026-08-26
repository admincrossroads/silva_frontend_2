"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessagesSquare, Plus, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { Modal } from "@/components/ui/modal";
import { formatDateTime } from "@/lib/utils/format";
import { useRole } from "@/hooks/use-role";
import {
  useCreateMessageThread,
  useMessageCounterparties,
  useMessageThreads,
  useReplyMessage,
} from "@/hooks/use-messages";
import type { MessageCounterpartyType } from "@/lib/api/messages";
import type { MessageEntityType } from "@/components/messages/start-message-button";
import { notificationEntityLabel } from "@/lib/notifications/entity-links";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type Props = {
  entityType: MessageEntityType;
  entityId: string;
  /** Prefills subject / first message context */
  title?: string;
  className?: string;
};

function canUseMessages(role: string) {
  return (
    role.startsWith("spx_") ||
    role.startsWith("silva_") ||
    role === "vendor_admin" ||
    role === "vendor_manager" ||
    role === "vendor_supervisor" ||
    role === "vendor_field_lead" ||
    role === "system_admin"
  );
}

/**
 * Upwork-style messages card scoped to one AFP / AFE / WO / etc.
 * Shows conversations linked to this entity and lets you start or reply in place.
 */
export function EntityMessagesPanel({ entityType, entityId, title, className }: Props) {
  const { role, isSpx, isSilva } = useRole();
  const [composeOpen, setComposeOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const threadsQuery = useMessageThreads({
    entityType,
    entityId,
    status: "open",
    enabled: Boolean(entityId) && canUseMessages(role),
  });
  const reply = useReplyMessage();

  const threads = threadsQuery.data || [];
  const active = threads.find((t) => t.id === activeThreadId) || threads[0] || null;

  if (!canUseMessages(role) || !entityId) return null;

  const entityLabel = notificationEntityLabel(entityType);
  const defaultSubject = title
    ? `${entityLabel} ${entityId}: ${title}`.slice(0, 120)
    : `${entityLabel} ${entityId}`;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <MessagesSquare className="h-4 w-4 text-primary" />
            Messages
          </h3>
          <p className="text-xs text-muted-foreground">
            About this {entityLabel.toLowerCase()} — like a job chat on Upwork
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setComposeOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New
        </Button>
      </div>

      {threadsQuery.isLoading ? (
        <div className="p-4 text-sm text-muted-foreground">Loading conversations…</div>
      ) : threads.length === 0 ? (
        <div className="space-y-3 p-4">
          <p className="text-sm text-muted-foreground">
            No messages linked to this {entityLabel.toLowerCase()} yet. Start a conversation with SPX
            or your counterparty about this item.
          </p>
          <Button size="sm" onClick={() => setComposeOpen(true)}>
            Message about this {entityLabel.toLowerCase()}
          </Button>
        </div>
      ) : (
        <div className="grid gap-0 md:grid-cols-[200px_1fr]">
          <aside className="max-h-64 overflow-y-auto border-b md:border-b-0 md:border-r">
            {threads.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveThreadId(t.id)}
                className={cn(
                  "flex w-full flex-col gap-0.5 border-b px-3 py-2.5 text-left text-xs transition-colors hover:bg-muted/50",
                  (active?.id === t.id ? "bg-primary/5" : ""),
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate font-medium">{t.subject}</span>
                  {t.unreadCount > 0 ? (
                    <Badge className="h-5 min-w-5 justify-center px-1 text-[10px]">{t.unreadCount}</Badge>
                  ) : null}
                </div>
                <span className="truncate text-muted-foreground">
                  {t.lastMessagePreview || "No messages"}
                </span>
              </button>
            ))}
          </aside>

          <div className="flex min-h-[200px] flex-col">
            {active ? (
              <>
                <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{active.subject}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Last activity {formatDateTime(active.lastMessageAt)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/messages?thread=${active.id}`}>Open full chat</Link>
                  </Button>
                </div>
                <div className="flex-1 space-y-2 p-3 text-sm">
                  {active.lastMessagePreview ? (
                    <div className="rounded-lg bg-muted/50 px-3 py-2">
                      <p className="text-[11px] text-muted-foreground">
                        {active.lastMessageSenderName || "Someone"}
                      </p>
                      <p className="mt-0.5 whitespace-pre-wrap">{active.lastMessagePreview}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No messages in this thread yet.</p>
                  )}
                </div>
                <div className="flex gap-2 border-t p-3">
                  <Textarea
                    rows={2}
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Reply about this item…"
                    className="min-h-[64px] flex-1"
                  />
                  <Button
                    size="sm"
                    className="shrink-0 self-end"
                    disabled={!replyBody.trim() || reply.isPending}
                    onClick={async () => {
                      await reply.mutateAsync({ threadId: active.id, body: replyBody.trim() });
                      setReplyBody("");
                      threadsQuery.refetch();
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      <EntityComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        entityType={entityType}
        entityId={entityId}
        defaultSubject={defaultSubject}
        isSpx={isSpx}
        isSilva={isSilva}
        onCreated={(threadId) => {
          setComposeOpen(false);
          setActiveThreadId(threadId);
          threadsQuery.refetch();
        }}
      />
    </Card>
  );
}

function EntityComposeModal({
  open,
  onClose,
  entityType,
  entityId,
  defaultSubject,
  isSpx,
  isSilva,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  entityType: MessageEntityType;
  entityId: string;
  defaultSubject: string;
  isSpx: boolean;
  isSilva: boolean;
  onCreated: (threadId: string) => void;
}) {
  const [counterpartyType, setCounterpartyType] = useState<MessageCounterpartyType>(
    isSilva ? "asset_owner" : "vendor",
  );
  const [orgId, setOrgId] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createThread = useCreateMessageThread();
  const counterparties = useMessageCounterparties(counterpartyType, open && isSpx);

  const entityLabel = useMemo(() => notificationEntityLabel(entityType), [entityType]);

  return (
    <Modal
      title={`Message about ${entityLabel}`}
      isOpen={open}
      onClose={onClose}
      className="sm:max-w-lg"
    >
      <div className="space-y-3 pb-2">
        <div className="rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Linked to <span className="font-mono font-medium text-foreground">{entityId}</span>
        </div>

        {isSpx ? (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Talk to</label>
              <Select
                value={counterpartyType}
                onChange={(e) => {
                  setCounterpartyType(e.target.value as MessageCounterpartyType);
                  setOrgId("");
                }}
              >
                <option value="vendor">Vendor</option>
                <option value="asset_owner">Asset owner</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Organization</label>
              <Select value={orgId} onChange={(e) => setOrgId(e.target.value)}>
                <option value="">Select…</option>
                {(counterparties.data || []).map((c) => (
                  <option key={c.organizationId} value={c.organizationId}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </>
        ) : (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            This conversation goes to SPX for this {entityLabel.toLowerCase()}.
          </p>
        )}

        <Input
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <Textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Ask a question or share an update about ${entityId}…`}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={
              createThread.isPending ||
              !subject.trim() ||
              !body.trim() ||
              (isSpx && !orgId)
            }
            onClick={async () => {
              setError(null);
              try {
                const thread = await createThread.mutateAsync({
                  subject: subject.trim(),
                  body: body.trim(),
                  entityType,
                  entityId,
                  ...(isSpx ? { counterpartyType, counterpartyOrganizationId: orgId } : {}),
                });
                onCreated(thread.id);
              } catch (err) {
                setError(getApiErrorMessage(err, "Could not start conversation"));
              }
            }}
          >
            {createThread.isPending ? "Sending…" : "Start conversation"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
