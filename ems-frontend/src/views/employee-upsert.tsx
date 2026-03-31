import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/errors";
import type { Department, Employee, Role } from "../lib/types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Modal } from "../ui/modal";
import { Select } from "../ui/select";

type Props = { mode: "create" | "edit" };

type FormValues = {
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  salary: string;
  role: Role;
  password?: string;
};

export function EmployeeUpsertPage({ mode }: Props) {
  const nav = useNavigate();
  const params = useParams();
  const id = params.id!;
  const [departments, setDepartments] = useState<Department[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      departmentId: "",
      salary: "",
      role: "EMPLOYEE",
      password: ""
    }
  });

  const title = useMemo(() => (mode === "create" ? "Add Employee" : "Edit Employee"), [mode]);

  async function loadDepartments() {
    const res = await api.get<Department[]>("/api/departments");
    setDepartments(res.data);
  }

  async function loadEmployee() {
    const res = await api.get<Employee>(`/api/employees/${id}`);
    const e = res.data;
    setValue("name", e.name);
    setValue("email", e.email);
    setValue("phone", e.phone);
    setValue("departmentId", e.department?.id ?? "");
    setValue("salary", String(e.salary));
    setValue("role", e.role);
  }

  useEffect(() => {
    loadDepartments().catch((e) => toast.error(getErrorMessage(e)));
  }, []);

  useEffect(() => {
    if (mode === "edit") {
      loadEmployee().catch((e) => toast.error(getErrorMessage(e)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function onSubmit(v: FormValues) {
    try {
      if (mode === "create") {
        const res = await api.post<{ employee: Employee; generatedPassword?: string | null }>("/api/employees", {
          ...v,
          salary: Number(v.salary),
          departmentId: v.departmentId || null,
          password: v.password || null
        });
        toast.success("Employee created");
        setGeneratedPassword(res.data.generatedPassword ?? null);
        nav("/employees", { replace: true });
      } else {
        await api.put(`/api/employees/${id}`, {
          ...v,
          salary: Number(v.salary),
          departmentId: v.departmentId || null
        });
        toast.success("Employee updated");
        nav("/employees", { replace: true });
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function onDelete() {
    try {
      await api.delete(`/api/employees/${id}`);
      toast.success("Employee deleted");
      nav("/employees", { replace: true });
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setConfirmOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-slate-500">Maintain accurate employee records.</div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/employees">
            <Button variant="secondary">Back</Button>
          </Link>
          {mode === "edit" ? (
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="p-5">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" error={errors.name?.message} {...register("name", { required: "Name is required" })} />
          <Input label="Email" error={errors.email?.message} {...register("email", { required: "Email is required" })} />
          <Input label="Phone" error={errors.phone?.message} {...register("phone", { required: "Phone is required" })} />
          <Input
            label="Salary"
            error={errors.salary?.message}
            inputMode="decimal"
            {...register("salary", { required: "Salary is required" })}
          />

          <Select label="Department" {...register("departmentId")}>
            <option value="">Unassigned</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>

          <Select label="Role" error={errors.role?.message} {...register("role", { required: "Role is required" })}>
            <option value="ADMIN">ADMIN</option>
            <option value="HR">HR</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
          </Select>

          {mode === "create" ? (
            <Input label="Password (optional)" placeholder="Leave blank to auto-generate" {...register("password")} />
          ) : (
            <div />
          )}

          <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => nav("/employees")}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </Card>

      <Modal
        open={confirmOpen}
        title="Delete employee?"
        onClose={() => setConfirmOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <div className="text-sm text-slate-600">This action is a soft delete. The user account will be disabled.</div>
      </Modal>

      <Modal
        open={!!generatedPassword}
        title="Generated password"
        onClose={() => setGeneratedPassword(null)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={async () => {
                if (generatedPassword) {
                  await navigator.clipboard.writeText(generatedPassword);
                  toast.success("Copied");
                }
              }}
            >
              Copy
            </Button>
            <Button onClick={() => setGeneratedPassword(null)}>Done</Button>
          </div>
        }
      >
        <div className="text-sm text-slate-600">Share this password with the employee for first login.</div>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm">{generatedPassword}</div>
      </Modal>
    </div>
  );
}

