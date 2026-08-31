"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContactSubmissions, useMarkContactRead } from "@/hooks/use-contact";
import type { ContactSubmission } from "@/lib/api/contact";
import { formatDate } from "@/lib/utils/format";

export default function ContactInboxPage() {
  const [status, setStatus] = useState<string>("");
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const { data, isLoading } = useContactSubmissions(status ? { status } : undefined);
  const markRead = useMarkContactRead();
  const items = data?.items ?? [];

  const openDetail = (row: ContactSubmission) => {
    setSelected(row);
    if (row.status === "new") {
      markRead.mutate(row.id);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-lg font-semibold">Contact inbox</h2>

      <div className="flex flex-wrap gap-2">
        {[
          { value: "", label: "All" },
          { value: "new", label: "New" },
          { value: "read", label: "Read" },
        ].map((filter) => (
          <Button
            key={filter.value || "all"}
            type="button"
            size="sm"
            variant={status === filter.value ? "default" : "outline"}
            onClick={() => setStatus(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Submissions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Loading messages…
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No contact messages yet.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id} className="cursor-pointer" onClick={() => openDetail(row)}>
                    <TableCell>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate">{row.subject}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "new" ? "default" : "secondary"}>{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected ? (
        <Modal open onClose={() => setSelected(null)} title={selected.subject} description={selected.email}>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium">From:</span> {selected.name}
              {selected.organization ? ` · ${selected.organization}` : ""}
            </p>
            <p>
              <span className="font-medium">Received:</span> {formatDate(selected.createdAt)}
            </p>
            <div className="rounded-lg border bg-muted/30 p-4 whitespace-pre-wrap leading-relaxed">{selected.message}</div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
