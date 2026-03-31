import React, { useEffect } from "react";
import { cn } from "../lib/cn";
import { Button } from "./button";

export function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  className
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={cn("w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-soft animate-slide-up", className)}>
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="text-base font-semibold">{title}</div>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
          <div className="px-5 py-4">{children}</div>
          {footer ? <div className="px-5 py-4 border-t border-slate-200">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

