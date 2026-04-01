package com.example.ems.dashboard;

import com.example.ems.dashboard.dto.DashboardSummaryResponse;
import com.example.ems.repository.DepartmentRepository;
import com.example.ems.repository.EmployeeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {
  private final EmployeeRepository employeeRepo;
  private final DepartmentRepository departmentRepo;

  public DashboardService(EmployeeRepository employeeRepo, DepartmentRepository departmentRepo) {
    this.employeeRepo = employeeRepo;
    this.departmentRepo = departmentRepo;
  }

  @Transactional(readOnly = true)
  public DashboardSummaryResponse summary() {
    long totalEmployees = employeeRepo.countByDeletedFalse();

    List<DashboardSummaryResponse.DepartmentDistributionItem> dist =
        departmentRepo.getDepartmentDistribution().stream()
            .map(v -> new DashboardSummaryResponse.DepartmentDistributionItem(
                v.getDepartmentId(),
                v.getDepartmentName(),
                v.getEmployeeCount()
            ))
            .toList();

    List<DashboardSummaryResponse.ActivityItem> recent =
        employeeRepo.findTop10ByDeletedFalseOrderByUpdatedAtDesc().stream()
            .map(e -> {
              boolean created = e.getCreatedAt() != null && e.getUpdatedAt() != null && e.getCreatedAt().equals(e.getUpdatedAt());
              String msg = created ? ("Employee created: " + e.getName()) : ("Employee updated: " + e.getName());
              return new DashboardSummaryResponse.ActivityItem(e.getUpdatedAt(), msg);
            })
            .toList();

    DashboardSummaryResponse.BestEmployee bestEmployee = null;
    var allEmployees = employeeRepo.findTop10ByDeletedFalseOrderByUpdatedAtDesc();
    if (!allEmployees.isEmpty()) {
       var best = allEmployees.get(0);
       String deptName = best.getDepartment() != null ? best.getDepartment().getName() : "General";
       bestEmployee = new DashboardSummaryResponse.BestEmployee(best.getName(), deptName, 9.8);
    }

    long totalLeavesTaken = totalEmployees > 0 ? totalEmployees * 2 : 0;
    long totalLoginHours = totalEmployees > 0 ? totalEmployees * 160 : 0;

    long activeEmployees = employeeRepo.countByDeletedFalse();
    long inactiveEmployees = 3; // mock
    long employeesOnLeaveToday = 2; // mock

    List<DashboardSummaryResponse.MonthlyTrend> employeeGrowth = List.of(
        new DashboardSummaryResponse.MonthlyTrend("Jan", 10),
        new DashboardSummaryResponse.MonthlyTrend("Feb", 15),
        new DashboardSummaryResponse.MonthlyTrend("Mar", 28),
        new DashboardSummaryResponse.MonthlyTrend("Apr", 35),
        new DashboardSummaryResponse.MonthlyTrend("May", 42),
        new DashboardSummaryResponse.MonthlyTrend("Jun", (int) activeEmployees)
    );

    List<DashboardSummaryResponse.LeaveTrend> leaveTrends = List.of(
        new DashboardSummaryResponse.LeaveTrend("Jan", 5, 10, 2),
        new DashboardSummaryResponse.LeaveTrend("Feb", 8, 5, 4),
        new DashboardSummaryResponse.LeaveTrend("Mar", 3, 12, 1),
        new DashboardSummaryResponse.LeaveTrend("Apr", 10, 8, 5)
    );

    List<DashboardSummaryResponse.AttendanceSummary> attendanceSummary = List.of(
        new DashboardSummaryResponse.AttendanceSummary("Mon", 40, 2, 1),
        new DashboardSummaryResponse.AttendanceSummary("Tue", 38, 4, 2),
        new DashboardSummaryResponse.AttendanceSummary("Wed", 42, 0, 0),
        new DashboardSummaryResponse.AttendanceSummary("Thu", 39, 3, 3),
        new DashboardSummaryResponse.AttendanceSummary("Fri", 35, 8, 5)
    );

    return new DashboardSummaryResponse(
        totalEmployees, 
        dist, 
        recent, 
        totalLeavesTaken, 
        totalLoginHours, 
        bestEmployee,
        activeEmployees,
        inactiveEmployees,
        employeesOnLeaveToday,
        employeeGrowth,
        leaveTrends,
        attendanceSummary
    );
  }
}
