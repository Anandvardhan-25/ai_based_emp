import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/errors";
import type { Department } from "../lib/types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Modal } from "../ui/modal";

export function DepartmentsPage() {
  const [items, setItems] = useState<Department[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState("");

  async function load() {
    try {
      const res = await api.get<Department[]>("/api/departments");
      setItems(res.data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditing(null);
    setName("");
    setOpen(true);
  }

  function startEdit(d: Department) {
    setEditing(d);
    setName(d.name);
    setOpen(true);
  }

  async function save() {
    try {
      if (!name.trim()) return toast.error("Name is required");
      if (!editing) {
        await api.post("/api/departments", { name });
        toast.success("Department created");
      } else {
        await api.put(`/api/departments/${editing.id}`, { name });
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
                <th className="text-right px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-semibold">{d.name}</td>
                  <td className="px-5 py-3 text-right space-x-2">
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
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      </Modal>
    </div>
  );
}

