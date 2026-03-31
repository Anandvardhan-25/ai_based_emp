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

    return new DashboardSummaryResponse(
        totalEmployees, 
        dist, 
        recent, 
        totalLeavesTaken, 
        totalLoginHours, 
        bestEmployee
    );
  }
}
