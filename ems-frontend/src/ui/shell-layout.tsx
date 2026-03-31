import React from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Building2, LayoutDashboard, LogOut, Users } from "lucide-react";
import { cn } from "../lib/cn";
import { useAuth } from "../state/auth";
import { Button } from "./button";
import { RoleBadge } from "./badge";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/departments", label: "Departments", icon: Building2 }
];

export function ShellLayout() {
  const { me, logout } = useAuth();
  const loc = useLocation();

  const title = (() => {
    if (loc.pathname === "/") return "Dashboard";
    if (loc.pathname.startsWith("/employees")) return "Employees";
    if (loc.pathname.startsWith("/departments")) return "Departments";
    return "EMS";
  })();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
          <aside className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <Link to="/" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">E</div>
                <div>
                  <div className="text-sm font-semibold">Employee Management</div>
                  <div className="text-xs text-slate-500">Corporate HR Dashboard</div>
                </div>
              </Link>
            </div>
            <nav className="p-3">
              {nav.map((n) => {
                const Icon = n.icon;
                return (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
                        isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                      )
                    }
                  >
                    <Icon size={18} />
                    {n.label}
                  </NavLink>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-200">
              <div className="text-xs text-slate-500">Signed in as</div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{me?.email}</div>
                  {me ? (
                    <div className="mt-1">
                      <RoleBadge role={me.role} />
                    </div>
                  ) : null}
                </div>
                <Button variant="secondary" onClick={logout} title="Logout">
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          </aside>

          <main className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{title}</div>
                <div className="text-sm text-slate-500">Manage employees and departments securely.</div>
              </div>
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

