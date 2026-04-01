export type Role = "ADMIN" | "HR" | "EMPLOYEE";

export type Me = {
  email: string;
  role: Role;
};

export type Department = {
  id: string;
  name: string;
  managerId?: string | null;
  managerName?: string | null;
};

export type DepartmentMetrics = {
  employeeCount: number;
  totalSalary: number;
  averageSalary: number;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: Department | null;
  salary: number;
  role: Role;
  skills: string[];
  createdAt: string;
  updatedAt: string;
};

export type SkillMatchResponse = {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
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
  activeEmployees: number;
  inactiveEmployees: number;
  employeesOnLeaveToday: number;
  employeeGrowth: Array<{ month: string; count: number }>;
  leaveTrends: Array<{ month: string; sick: number; casual: number; paid: number }>;
  attendanceSummary: Array<{ day: string; present: number; absent: number; late: number }>;
};

export type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
};
