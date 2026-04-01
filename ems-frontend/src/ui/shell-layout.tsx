import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Building2, LayoutDashboard, LogOut, Users, Target, Moon, Sun, Shield, DollarSign, FileText, CalendarRange } from "lucide-react";
import { cn } from "../lib/cn";
import { useAuth } from "../state/auth";
import { Button } from "./button";
import { RoleBadge } from "./badge";
import { NotificationsDropdown } from "./notifications-dropdown";
import { WebSocketClient } from "../lib/ws";
import toast from "react-hot-toast";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/departments", label: "Departments", icon: Building2, roles: ["ADMIN", "HR"] },
  { to: "/skills", label: "Skills Matching", icon: Target, roles: ["ADMIN", "HR"] },
  { to: "/apply-leave", label: "Apply Leave", icon: CalendarRange, roles: ["ADMIN", "HR", "EMPLOYEE"] },
  { to: "/my-leaves", label: "My Leaves", icon: CalendarRange, roles: ["ADMIN", "HR", "EMPLOYEE"] },
  { to: "/admin-leaves", label: "Leave Requests", icon: CalendarRange, roles: ["ADMIN", "HR"] },
  { to: "/payroll", label: "Payroll", icon: DollarSign, roles: ["ADMIN", "HR"] },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/audit", label: "Audit Logs", icon: Shield, roles: ["ADMIN"] }
];

export function ShellLayout() {
  const { me, logout } = useAuth();
  const loc = useLocation();

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!me) return;

    const ws = new WebSocketClient();
    ws.connect(
      () => console.log("WebSocket connected"),
      (notif) => {
        toast("New notification: " + notif.message, { icon: "🔔" });
        window.dispatchEvent(new Event("ws:notification"));
      },
      () => {
        window.dispatchEvent(new Event("ws:dashboard-update"));
      }
    );

    return () => ws.disconnect();
  }, [me]);

  const title = (() => {
    if (loc.pathname === "/") return "Dashboard";
    if (loc.pathname.startsWith("/employees")) return "Employees";
    if (loc.pathname.startsWith("/departments")) return "Departments";
    if (loc.pathname.startsWith("/skills")) return "Skills Matching";
    return "EMS";
  })();

  return (
    <div className="min-h-screen transition-colors duration-200">
      <div className="mx-auto max-w-7xl p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
          <aside className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <Link to="/" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 grid place-items-center font-bold transition-colors duration-200">E</div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Employee Management</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Corporate HR Dashboard</div>
                </div>
              </Link>
            </div>
            <nav className="p-3">
              {nav.map((n) => {
                if (n.roles && me && !n.roles.includes(me.role)) return null;
                const Icon = n.icon;
                return (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-200",
                        isActive ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )
                    }
                  >
                    <Icon size={18} />
                    {n.label}
                  </NavLink>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Signed in as</div>
              <div className="mt-1 flex items-center justify-between gap-1">
                <div className="min-w-0 pr-2">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{me?.email}</div>
                  {me ? (
                    <div className="mt-1">
                      <RoleBadge role={me.role} />
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" className="px-2" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Toggle Theme">
                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  </Button>
                  <Button variant="secondary" className="px-2" onClick={logout} title="Logout">
                    <LogOut size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          <main className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in transition-colors duration-200">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Manage employees and departments securely.</div>
              </div>
              <NotificationsDropdown />
            </div>
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

