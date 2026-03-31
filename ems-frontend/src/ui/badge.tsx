import React from "react";
import { cn } from "../lib/cn";
import type { Role } from "../lib/types";

export function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, string> = {
    ADMIN: "bg-indigo-50 text-indigo-700 border-indigo-200",
    HR: "bg-emerald-50 text-emerald-700 border-emerald-200",
    EMPLOYEE: "bg-slate-50 text-slate-700 border-slate-200"
  };
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", map[role])}>{role}</span>;
}

