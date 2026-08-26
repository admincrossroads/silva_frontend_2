"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Archive,
  Download,
  FileCheck,
  MessagesSquare,
  Paperclip,
  Plus,
  Send,
  Truck,
  Landmark,
} from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format";
import { useRole } from "@/hooks/use-role";
import {
  useCreateMessageThread,
  useMarkThreadRead,
  useMessageCounterparties,
  useMessageThread,
  useMessageThreads,
  usePatchMessageThread,
  useReplyMessage,
} from "@/hooks/use-messages";
import { platformApi } from "@/lib/api/platform";
import { notificationEntityHref, notificationEntityLabel } from "@/lib/notifications/entity-links";
import type { MessageCounterpartyType, MessageThread } from "@/lib/api/messages";

async function uploadFilesToMessage(messageId: string, files: File[]) {
  for (const file of files) {
    const signed = await platformApi.requestUploadUrl({
      entityType: "message",
      entityId: messageId,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    });
    const put = await fetch(signed.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!put.ok) throw new Error(`Upload failed for ${file.name}`);
    await platformApi.createAttachment({
      entityType: "message",
      entityId: messageId,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      storageKey: signed.storageKey,
    });
  }
}

function counterpartyLabel(thread: MessageThread, isSpx: boolean) {
  if (isSpx) return thread.counterpartyOrganizationName || "Counterparty";
  return thread.spxOrganizationName || "SPX";
}

function MessagesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isSpx, isVendor, isSilva } = useRole();
  const threadFromUrl = searchParams.get("thread");
  const composeFromUrl = searchParams.get("compose") === "1";
  const entityTypeFromUrl = searchParams.get("entityType") || "";
  const entityIdFromUrl = searchParams.get("entityId") || "";
  const subjectFromUrl = searchParams.get("subject") || "";

  const [typeFilter, setTypeFilter] = useState<"all" | MessageCounterpartyType>("all");
  const [statusFilter, setStatusFilter] = useState<"open" | "archived">("open");
  const [selectedId, setSelectedId] = useState<string | null>(threadFromUrl);
  const [composeOpen, setComposeOpen] = useState(composeFromUrl);
  const [draftBody, setDraftBody] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const listParams = useMemo(
    () => ({
      status: statusFilter,
      ...(isSpx && typeFilter !== "all" ? { counterpartyType: typeFilter } : {}),
    }),
    [isSpx, typeFilter, statusFilter],
  );

  const threadsQuery = useMessageThreads(listParams);
  const threadQuery = useMessageThread(selectedId);
  const markRead = useMarkThreadRead();
  const reply = useReplyMessage();
  const patchThread = usePatchMessageThread();
  const createThread = useCreateMessageThread();

  const threads = threadsQuery.data || [];
  const selected = threads.find((t) => t.id === selectedId) || threadQuery.data?.thread || null;

  useEffect(() => {
    if (threadFromUrl) setSelectedId(threadFromUrl);
  }, [threadFromUrl]);

  useEffect(() => {
    if (composeFromUrl) setComposeOpen(true);
  }, [composeFromUrl, entityTypeFromUrl, entityIdFromUrl, subjectFromUrl]);

  useEffect(() => {
    if (!selectedId && threads.length && !threadFromUrl) {
      setSelectedId(threads[0].id);
    }
  }, [threads, selectedId, threadFromUrl]);

  useEffect(() => {
    if (selectedId) {
      markRead.mutate(selectedId);
      router.replace(`/messages?thread=${selectedId}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadQuery.data?.messages?.length]);

  const selectThread = useCallback((id: string) => {
    setSelectedId(id);
    setDraftBody("");
    setPendingFiles([]);
  }, []);

  const onSend = async () => {
    if (!selectedId || !draftBody.trim()) return;
    const msg = await reply.mutateAsync({ threadId: selectedId, body: draftBody.trim() });
    if (pendingFiles.length) {
      await uploadFilesToMessage(msg.id, pendingFiles);
      await threadQuery.refetch();
    }
    setDraftBody("");
    setPendingFiles([]);
  };

  const linkedHref =
    selected?.entityType && selected?.entityId
      ? notificationEntityHref(selected.entityType, selected.entityId)
      : null;

  const vendorIdForCta = useMemo(() => {
    if (!isSpx || selected?.counterpartyType !== "vendor") return null;
    return selected.counterpartyOrganizationId;
  }, [isSpx, selected]);

  return (
    <PageShell>
      <PageHeader
        title="Messages"
        description="Coordinate with SPX, vendors, and asset owners — ask questions and share files before and during work."
        actions={
          <Button onClick={() => setComposeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New conversation
          </Button>
        }
      />
      <PageContent>
        <div className="grid min-h-[70vh] grid-cols-1 overflow-hidden rounded-xl border bg-card lg:grid-cols-[320px_1fr]">
          <aside className="flex flex-col border-b lg:border-b-0 lg:border-r">
            <div className="flex flex-wrap gap-2 border-b p-3">
              {isSpx ? (
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as "all" | MessageCounterpartyType)}
                  className="h-8 w-full text-xs"
                >
                  <option value="all">All counterparties</option>
                  <option value="vendor">Vendors</option>
                  <option value="asset_owner">Asset owners</option>
                </Select>
              ) : null}
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "open" | "archived")}
                className="h-8 w-full text-xs"
              >
                <option value="open">Open</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
            <div className="flex-1 overflow-y-auto">
              {threadsQuery.isLoading ? (
                <p className="p-4 text-sm text-muted-foreground">Loading…</p>
              ) : threads.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
                  <MessagesSquare className="h-8 w-8 opacity-40" />
                  <p>No conversations yet.</p>
                  <Button size="sm" variant="outline" onClick={() => setComposeOpen(true)}>
                    Start one
                  </Button>
                </div>
              ) : (
                threads.map((t) => {
                  const active = t.id === selectedId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => selectThread(t.id)}
                      className={cn(
                        "w-full border-b px-3 py-3 text-left transition-colors",
                        active ? "bg-primary/10" : "hover:bg-muted/60",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="shrink-0 text-[10px] uppercase">
                              {t.counterpartyType === "vendor" ? "Vendor" : "Owner"}
                            </Badge>
                            {t.unreadCount > 0 ? (
                              <span className="rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                                {t.unreadCount}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 truncate text-sm font-medium">{t.subject}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {counterpartyLabel(t, isSpx)}
                          </p>
                          {t.lastMessagePreview ? (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground/80">
                              {t.lastMessagePreview}
                            </p>
                          ) : null}
                        </div>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatDateTime(t.lastMessageAt)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="flex min-h-[420px] flex-col">
            {!selectedId || !selected ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
                <MessagesSquare className="h-10 w-10 opacity-30" />
                <p className="text-sm">Select a conversation</p>
              </div>
            ) : (
              <>
                <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">{selected.subject}</h2>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {selected.counterpartyType === "vendor" ? (
                        <Truck className="h-3.5 w-3.5" />
                      ) : (
                        <Landmark className="h-3.5 w-3.5" />
                      )}
                      {counterpartyLabel(selected, isSpx)}
                      {linkedHref ? (
                        <>
                          <span>·</span>
                          <Link href={linkedHref} className="text-primary hover:underline">
                            {notificationEntityLabel(selected.entityType!)} {selected.entityId}
                          </Link>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isSpx && selected.counterpartyType === "vendor" ? (
                      <>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/planning/afe?vendorOrg=${vendorIdForCta || ""}&fromThread=${selected.id}`}>
                            <FileCheck className="mr-1.5 h-3.5 w-3.5" /> Create AFE
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link
                            href={`/execution/work-orders?vendorOrg=${vendorIdForCta || ""}&fromThread=${selected.id}`}
                          >
                            Create work order
                          </Link>
                        </Button>
                      </>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        patchThread.mutate({
                          threadId: selected.id,
                          dto: { status: selected.status === "archived" ? "open" : "archived" },
                        })
                      }
                    >
                      <Archive className="mr-1.5 h-3.5 w-3.5" />
                      {selected.status === "archived" ? "Reopen" : "Archive"}
                    </Button>
                  </div>
                </header>

                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {threadQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading messages…</p>
                  ) : (
                    (threadQuery.data?.messages || []).map((m) => {
                      const mine = m.senderUserId === user?.id;
                      return (
                        <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm",
                              mine
                                ? "rounded-br-md bg-primary text-primary-foreground"
                                : "rounded-bl-md bg-muted",
                            )}
                          >
                            {!mine ? (
                              <p className="mb-0.5 text-[11px] font-medium opacity-70">{m.senderName}</p>
                            ) : null}
                            <p className="whitespace-pre-wrap">{m.body}</p>
                            {m.attachments?.length ? (
                              <ul className="mt-2 space-y-1">
                                {m.attachments.map((a) => (
                                  <li key={a.id}>
                                    <button
                                      type="button"
                                      className={cn(
                                        "inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline",
                                        mine ? "text-primary-foreground/90" : "text-primary",
                                      )}
                                      onClick={async () => {
                                        const att = await platformApi.getAttachment(a.id);
                                        if (att?.downloadUrl) window.open(att.downloadUrl, "_blank");
                                      }}
                                    >
                                      <Download className="h-3 w-3" />
                                      {a.fileName}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                            <p
                              className={cn(
                                "mt-1 text-[10px]",
                                mine ? "text-primary-foreground/70" : "text-muted-foreground",
                              )}
                            >
                              {formatDateTime(m.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {selected.status === "archived" ? (
                  <p className="border-t px-4 py-3 text-center text-sm text-muted-foreground">
                    This conversation is archived. Reopen to reply.
                  </p>
                ) : (
                  <div className="border-t p-3">
                    {pendingFiles.length ? (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {pendingFiles.map((f) => (
                          <Badge key={f.name + f.size} variant="secondary" className="text-xs">
                            <Paperclip className="mr-1 h-3 w-3" />
                            {f.name}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <div className="flex items-end gap-2">
                      <Textarea
                        value={draftBody}
                        onChange={(e) => setDraftBody(e.target.value)}
                        placeholder={
                          isVendor
                            ? "Reply to SPX…"
                            : isSilva
                              ? "Ask SPX about this work…"
                              : "Write a message…"
                        }
                        rows={2}
                        className="min-h-[64px] flex-1 resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            void onSend();
                          }
                        }}
                      />
                      <input
                        ref={fileRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const list = Array.from(e.target.files || []);
                          if (list.length) setPendingFiles((prev) => [...prev, ...list]);
                          e.target.value = "";
                        }}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => fileRef.current?.click()}
                        title="Attach files"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        disabled={!draftBody.trim() || reply.isPending}
                        onClick={() => void onSend()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">Ctrl+Enter to send</p>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </PageContent>

      <NewConversationModal
        open={composeOpen}
        onClose={() => {
          setComposeOpen(false);
          if (composeFromUrl) {
            router.replace("/messages", { scroll: false });
          }
        }}
        isSpx={isSpx}
        isVendor={isVendor}
        isSilva={isSilva}
        createThread={createThread}
        initialEntityType={entityTypeFromUrl}
        initialEntityId={entityIdFromUrl}
        initialSubject={subjectFromUrl}
        onCreated={(id) => {
          setComposeOpen(false);
          if (composeFromUrl) {
            router.replace(`/messages?thread=${id}`, { scroll: false });
          }
          selectThread(id);
          void threadsQuery.refetch();
        }}
      />
    </PageShell>
  );
}

function NewConversationModal({
  open,
  onClose,
  isSpx,
  isVendor,
  isSilva,
  createThread,
  onCreated,
  initialEntityType = "",
  initialEntityId = "",
  initialSubject = "",
}: {
  open: boolean;
  onClose: () => void;
  isSpx: boolean;
  isVendor: boolean;
  isSilva: boolean;
  createThread: ReturnType<typeof useCreateMessageThread>;
  onCreated: (threadId: string) => void;
  initialEntityType?: string;
  initialEntityId?: string;
  initialSubject?: string;
}) {
  const [counterpartyType, setCounterpartyType] = useState<MessageCounterpartyType>("vendor");
  const [orgId, setOrgId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const counterparties = useMessageCounterparties(counterpartyType, open && isSpx);

  useEffect(() => {
    if (!open) {
      setSubject("");
      setBody("");
      setOrgId("");
      setEntityType("");
      setEntityId("");
      setFiles([]);
      setCounterpartyType(isSilva ? "asset_owner" : "vendor");
      return;
    }
    setSubject(initialSubject);
    setEntityType(initialEntityType);
    setEntityId(initialEntityId);
    setCounterpartyType(isSilva ? "asset_owner" : "vendor");
  }, [open, isSilva, initialSubject, initialEntityType, initialEntityId]);

  const submit = async () => {
    const dto = {
      subject: subject.trim(),
      body: body.trim(),
      ...(isSpx ? { counterpartyType, counterpartyOrganizationId: orgId } : {}),
      ...(entityType && entityId ? { entityType, entityId } : {}),
    };
    const thread = await createThread.mutateAsync(dto);
    if (files.length && thread.firstMessageId) {
      await uploadFilesToMessage(thread.firstMessageId, files);
    }
    onCreated(thread.id);
  };

  return (
    <Modal title="New conversation" isOpen={open} onClose={onClose} className="sm:max-w-lg">
      <div className="space-y-3 pb-4">
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
            {isVendor
              ? "This conversation goes to SPX for coordination."
              : "Message SPX about current tasks, approvals, or requests."}
          </p>
        )}

        <Input
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Pruning quote — Block A"
        />
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="First message…"
          rows={4}
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Linked task type (optional)
            </label>
            <Select value={entityType} onChange={(e) => setEntityType(e.target.value)}>
              <option value="">None</option>
              <option value="afp_line">AFP</option>
              <option value="afe">AFE</option>
              <option value="work_order">Work order</option>
              <option value="field_ticket">Field ticket</option>
              <option value="work_plan_submission">Work plan</option>
              <option value="ad_hoc_request">Ad-hoc request</option>
              <option value="farm_estate">Farm estate</option>
              <option value="payment_request">Payment request</option>
              <option value="owner_settlement">Settlement</option>
            </Select>
          </div>
          <Input
            label="Task ID (optional)"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            placeholder="ID"
            disabled={!entityType}
          />
        </div>

        <div>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              setFiles(Array.from(e.target.files || []));
              e.target.value = "";
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Paperclip className="mr-1.5 h-3.5 w-3.5" />
            {files.length ? `${files.length} file(s)` : "Attach files"}
          </Button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!subject.trim() || !body.trim() || createThread.isPending || (isSpx && !orgId)}
            onClick={() => void submit()}
          >
            {createThread.isPending ? "Starting…" : "Start conversation"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading messages…</div>}>
      <MessagesPageInner />
    </Suspense>
  );
}
