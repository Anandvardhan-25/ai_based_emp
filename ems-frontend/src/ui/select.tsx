import React from "react";
import { cn } from "../lib/cn";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export function Select({ className, label, error, children, ...props }: Props) {
  return (
    <label className="block">
      {label ? <div className="text-sm font-medium text-slate-700 mb-1">{label}</div> : null}
      <select
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition",
          "border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100",
          error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </label>
  );
}

