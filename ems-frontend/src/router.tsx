import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./state/require-auth";
import { ShellLayout } from "./ui/shell-layout";
import { LoginPage } from "./views/login";
import { DashboardPage } from "./views/dashboard";
import { EmployeesPage } from "./views/employees";
import { EmployeeUpsertPage } from "./views/employee-upsert";
import { DepartmentsPage } from "./views/departments";
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
      { path: "employees/new", element: <EmployeeUpsertPage mode="create" /> },
      { path: "employees/:id", element: <EmployeeUpsertPage mode="edit" /> },
      { path: "departments", element: <DepartmentsPage /> }
    ]
  },
  { path: "/404", element: <NotFoundPage /> },
  { path: "*", element: <Navigate to="/404" replace /> }
]);

