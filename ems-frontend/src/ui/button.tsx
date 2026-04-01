import React from "react";
import { cn } from "../lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition " +
    "disabled:opacity-60 disabled:cursor-not-allowed";

  const variants: Record<string, string> = {
    primary: "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white shadow-sm",
    secondary: "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800",
    danger: "bg-rose-600 dark:bg-rose-700 text-white hover:bg-rose-500 dark:hover:bg-rose-600",
    ghost: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
  };

  return <button className={cn(base, variants[variant], className)} {...props} />;
}

