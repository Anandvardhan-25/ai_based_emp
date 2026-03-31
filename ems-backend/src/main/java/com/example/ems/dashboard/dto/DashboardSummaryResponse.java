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
    BestEmployee bestEmployee
) {
  public record DepartmentDistributionItem(UUID departmentId, String departmentName, long employeeCount) {}

  public record ActivityItem(Instant at, String message) {}

  public record BestEmployee(String name, String department, double performanceScore) {}
}

