"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import { Download, Paperclip, Trash2, Upload } from "lucide-react";

type Attachment = {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
};

type Props = {
  entityType: string;
  entityId: string;
  canUpload?: boolean;
};

export function AttachmentsPanel({ entityType, entityId, canUpload = false }: Props) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const { data: attachments = [], isLoading } = useQuery<Attachment[]>({
    queryKey: ["attachments", entityType, entityId],
    queryFn: () => platformApi.listAttachments({ entityType, entityId }),
    enabled: Boolean(entityType && entityId),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["attachments", entityType, entityId] });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const signed = await platformApi.requestUploadUrl({
        entityType,
        entityId,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });
      const put = await fetch(signed.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!put.ok) throw new Error("Upload failed");
      return platformApi.createAttachment({
        entityType,
        entityId,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        storageKey: signed.storageKey,
      });
    },
    onSuccess: () => {
      setError("");
      invalidate();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Upload failed")),
  });

  const download = useMutation({
    mutationFn: async (id: string) => {
      const att = await platformApi.getAttachment(id);
      window.open(att.downloadUrl, "_blank", "noopener,noreferrer");
    },
    onError: (err) => setError(getApiErrorMessage(err, "Download failed")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => platformApi.deleteAttachment(id),
    onSuccess: () => {
      setError("");
      invalidate();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Delete failed")),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Paperclip className="h-4 w-4" />
          Attachments
        </CardTitle>
        {canUpload ? (
          <>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload.mutate(file);
                e.target.value = "";
              }}
            />
            <Button
              size="sm"
              variant="secondary"
              disabled={upload.isPending}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload
            </Button>
          </>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No attachments yet.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {attachments.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {(a.sizeBytes / 1024).toFixed(1)} KB · {formatDate(a.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={download.isPending}
                    onClick={() => download.mutate(a.id)}
                    aria-label="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {canUpload ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(a.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
        {canUpload ? (
          <p className="text-xs text-muted-foreground">Deletes are only allowed while the parent is draft.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
