import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/errors";
import type { Department, Employee, PageResponse, Role } from "../lib/types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Pagination } from "../ui/pagination";
import { RoleBadge } from "../ui/badge";
import { Select } from "../ui/select";

export function EmployeesPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [items, setItems] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState("name");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);

  async function loadDepartments() {
    try {
      const res = await api.get<Department[]>("/api/departments");
      setDepartments(res.data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function loadEmployees() {
    setLoading(true);
    try {
      const res = await api.get<PageResponse<Employee>>("/api/employees", {
        params: {
          page,
          size,
          sortBy,
          dir,
          search: search || undefined,
          departmentId: departmentId || undefined
        }
      });
      setItems(res.data.items);
      setTotalPages(res.data.totalPages);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, dir, departmentId]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadEmployees();
  };

  const sortLabel = useMemo(() => {
    const map: Record<string, string> = { name: "Name", email: "Email", salary: "Salary", role: "Role" };
    return map[sortBy] ?? sortBy;
  }, [sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <form onSubmit={onSearch} className="flex flex-col md:flex-row md:items-end gap-3">
          <Input
            label="Search"
            placeholder="Name, email, department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select label="Department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">All</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          <Button variant="secondary" type="submit">
            Apply
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Select
            aria-label="Sort by"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(0);
            }}
          >
            <option value="name">Sort: Name</option>
            <option value="email">Sort: Email</option>
            <option value="salary">Sort: Salary</option>
            <option value="role">Sort: Role</option>
          </Select>
          <Button
            variant="secondary"
            onClick={() => {
              setDir(dir === "asc" ? "desc" : "asc");
              setPage(0);
            }}
            title={`Sort direction: ${dir}`}
          >
            {dir === "asc" ? "Asc" : "Desc"}
          </Button>
          <Link to="/employees/new">
            <Button>Add Employee</Button>
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold">
            Employees <span className="text-slate-500 font-medium">(sorted by {sortLabel})</span>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Name</th>
                <th className="text-left px-5 py-3 font-semibold">Email</th>
                <th className="text-left px-5 py-3 font-semibold">Department</th>
                <th className="text-left px-5 py-3 font-semibold">Role</th>
                <th className="text-right px-5 py-3 font-semibold">Salary</th>
                <th className="text-right px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-semibold">{e.name}</td>
                  <td className="px-5 py-3 text-slate-700">{e.email}</td>
                  <td className="px-5 py-3 text-slate-700">{e.department?.name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <RoleBadge role={e.role as Role} />
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{Number(e.salary).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <Link to={`/employees/${e.id}`}>
                      <Button variant="secondary">Edit</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    {loading ? "Loading…" : "No employees found."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="px-5">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </Card>
    </div>
  );
}

