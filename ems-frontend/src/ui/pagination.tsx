import React from "react";
import { Button } from "./button";

export function Pagination({
  page,
  totalPages,
  onChange
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="text-sm text-slate-600">
        Page <span className="font-semibold text-slate-900">{page + 1}</span> of{" "}
        <span className="font-semibold text-slate-900">{Math.max(totalPages, 1)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" disabled={!canPrev} onClick={() => onChange(page - 1)}>
          Prev
        </Button>
        <Button variant="secondary" disabled={!canNext} onClick={() => onChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

