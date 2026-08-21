"use client";

import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

/** Slide-over panel backed by Radix Sheet. Keeps legacy Modal prop API. */
export function Modal({
  open,
  isOpen,
  onClose,
  children,
  className,
  title,
  description,
}: ModalProps) {
  const visible = open ?? isOpen ?? false;

  return (
    <Sheet open={visible} onOpenChange={(next) => !next && onClose()}>
      <SheetContent className={cn("flex flex-col", className)}>
        {(title || description) && (
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
