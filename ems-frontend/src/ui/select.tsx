import React from "react";
import { cn } from "../lib/cn";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export function Select({ className, label, error, children, ...props }: Props) {
  return (
    <label className="block">
      {label ? <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</div> : null}
      <select
        className={cn(
          "w-full rounded-lg border bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none transition-colors duration-200",
          "border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-600 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800/50 text-slate-900 dark:text-slate-50",
          error ? "border-rose-300 dark:border-rose-700 focus:border-rose-400 focus:ring-rose-100 dark:focus:ring-rose-900/40" : "",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <div className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</div> : null}
    </label>
  );
}

