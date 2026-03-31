import React from "react";

export function Spinner() {
  return (
    <div className="flex items-center gap-3 text-slate-600">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      <div className="text-sm">Loading…</div>
    </div>
  );
}

