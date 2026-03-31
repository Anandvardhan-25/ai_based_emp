export type Role = "ADMIN" | "HR" | "EMPLOYEE";

export type Me = {
  email: string;
  role: Role;
};

export type Department = { id: string; name: string };

export type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: Department | null;
  salary: number;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type DashboardSummary = {
  totalEmployees: number;
  departmentDistribution: Array<{ departmentId: string; departmentName: string; employeeCount: number }>;
  recentActivity: Array<{ at: string; message: string }>;
  totalLeavesTaken: number;
  totalLoginHours: number;
  bestEmployee: { name: string; department: string; performanceScore: number } | null;
};
