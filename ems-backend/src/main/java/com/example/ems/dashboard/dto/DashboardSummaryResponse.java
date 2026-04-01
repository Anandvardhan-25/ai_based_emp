package com.example.ems.dashboard.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DashboardSummaryResponse(
    long totalEmployees,
    List<DepartmentDistributionItem> departmentDistribution,
    List<ActivityItem> recentActivity,
    long totalLeavesTaken,
    long totalLoginHours,
    BestEmployee bestEmployee,
    long activeEmployees,
    long inactiveEmployees,
    long employeesOnLeaveToday,
    List<MonthlyTrend> employeeGrowth,
    List<LeaveTrend> leaveTrends,
    List<AttendanceSummary> attendanceSummary
) {
  public record DepartmentDistributionItem(UUID departmentId, String departmentName, long employeeCount) {}

  public record ActivityItem(Instant at, String message) {}

  public record BestEmployee(String name, String department, double performanceScore) {}

  public record MonthlyTrend(String month, int count) {}
  public record LeaveTrend(String month, int sick, int casual, int paid) {}
  public record AttendanceSummary(String day, int present, int absent, int late) {}
}

