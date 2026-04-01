import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./state/require-auth";
import { ShellLayout } from "./ui/shell-layout";
import { LoginPage } from "./views/login";
import { DashboardPage } from "./views/dashboard";
import { EmployeesPage } from "./views/employees";
import { EmployeeUpsertPage } from "./views/employee-upsert";
import { DepartmentsPage } from "./views/departments";
import { SkillsPage } from "./views/skills";
import { AuditPage } from "./views/audit";
import { PayrollPage } from "./views/payroll";
import { DocumentsPage } from "./views/documents";
import { ApplyLeavePage } from "./views/apply-leave";
import { MyLeavesPage } from "./views/my-leaves";
import { AdminLeavesPage } from "./views/admin-leaves";
import { ForgotPasswordPage } from "./views/forgot-password";
import { NotFoundPage } from "./views/not-found";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <ShellLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "employees", element: <EmployeesPage /> },
      { path: "employees/new", element: <RequireAuth roles={["ADMIN", "HR"]}><EmployeeUpsertPage mode="create" /></RequireAuth> },
      { path: "employees/:id", element: <RequireAuth roles={["ADMIN", "HR"]}><EmployeeUpsertPage mode="edit" /></RequireAuth> },
      { path: "departments", element: <RequireAuth roles={["ADMIN", "HR"]}><DepartmentsPage /></RequireAuth> },
      { path: "skills", element: <RequireAuth roles={["ADMIN", "HR"]}><SkillsPage /></RequireAuth> },
      { path: "audit", element: <RequireAuth roles={["ADMIN"]}><AuditPage /></RequireAuth> },
      { path: "payroll", element: <RequireAuth roles={["ADMIN", "HR"]}><PayrollPage /></RequireAuth> },
      { path: "documents", element: <RequireAuth roles={["ADMIN", "HR", "EMPLOYEE"]}><DocumentsPage /></RequireAuth> },
      { path: "apply-leave", element: <RequireAuth roles={["ADMIN", "HR", "EMPLOYEE"]}><ApplyLeavePage /></RequireAuth> },
      { path: "my-leaves", element: <RequireAuth roles={["ADMIN", "HR", "EMPLOYEE"]}><MyLeavesPage /></RequireAuth> },
      { path: "admin-leaves", element: <RequireAuth roles={["ADMIN", "HR"]}><AdminLeavesPage /></RequireAuth> }
    ]
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/404", element: <NotFoundPage /> },
  { path: "*", element: <Navigate to="/404" replace /> }
]);
