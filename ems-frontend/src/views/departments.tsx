import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/errors";
import type { Department, Employee, PageResponse, DepartmentMetrics } from "../lib/types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Modal } from "../ui/modal";

export function DepartmentsPage() {
  const [items, setItems] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [managerId, setManagerId] = useState("");
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [metrics, setMetrics] = useState<DepartmentMetrics | null>(null);
  const [metricsDeptName, setMetricsDeptName] = useState("");

  async function load() {
    try {
      const res = await api.get<Department[]>("/api/departments");
      setItems(res.data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function loadEmployees() {
    try {
      const res = await api.get<PageResponse<Employee>>("/api/employees", { params: { size: 1000 } });
      setEmployees(res.data.items);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    load();
    loadEmployees();
  }, []);

  function startCreate() {
    setEditing(null);
    setName("");
    setManagerId("");
    setOpen(true);
  }

  function startEdit(d: Department) {
    setEditing(d);
    setName(d.name);
    setManagerId(d.managerId || "");
    setOpen(true);
  }

  async function viewMetrics(d: Department) {
    try {
      const res = await api.get<DepartmentMetrics>(`/api/departments/${d.id}/metrics`);
      setMetrics(res.data);
      setMetricsDeptName(d.name);
      setMetricsOpen(true);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function save() {
    try {
      if (!name.trim()) return toast.error("Name is required");
      const payload = { name, managerId: managerId || null };
      if (!editing) {
        await api.post("/api/departments", payload);
        toast.success("Department created");
      } else {
        await api.put(`/api/departments/${editing.id}`, payload);
        toast.success("Department updated");
      }
      setOpen(false);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function remove(d: Department) {
    if (!confirm(`Delete department "${d.name}"?`)) return;
    try {
      await api.delete(`/api/departments/${d.id}`);
      toast.success("Department deleted");
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Departments</div>
          <div className="text-sm text-slate-500">Organize employees into departments.</div>
        </div>
        <Button onClick={startCreate}>Add Department</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Name</th>
                <th className="text-left px-5 py-3 font-semibold">Manager</th>
                <th className="text-right px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-semibold">{d.name}</td>
                  <td className="px-5 py-3 text-slate-600">{d.managerName || "—"}</td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Button variant="secondary" onClick={() => viewMetrics(d)}>
                      Metrics
                    </Button>
                    <Button variant="secondary" onClick={() => startEdit(d)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => remove(d)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-5 py-8 text-center text-slate-500">
                    No departments yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={open}
        title={editing ? "Edit Department" : "Add Department"}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Select label="Manager" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
            <option value="">None</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
            ))}
          </Select>
        </div>
      </Modal>

      <Modal open={metricsOpen} onClose={() => setMetricsOpen(false)} title={`Metrics: ${metricsDeptName}`}>
        {metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-slate-50">
                <div className="text-sm font-medium text-slate-500">Total Employees</div>
                <div className="text-2xl font-bold">{metrics.employeeCount}</div>
              </Card>
              <Card className="p-4 bg-slate-50">
                <div className="text-sm font-medium text-slate-500">Average Salary</div>
                <div className="text-2xl font-bold">${Number(metrics.averageSalary).toLocaleString()}</div>
              </Card>
              <Card className="p-4 bg-slate-50 md:col-span-2">
                <div className="text-sm font-medium text-slate-500">Total Salary</div>
                <div className="text-2xl font-bold">${Number(metrics.totalSalary).toLocaleString()}</div>
              </Card>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setMetricsOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

