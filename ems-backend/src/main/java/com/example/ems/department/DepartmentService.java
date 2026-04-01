package com.example.ems.department;

import com.example.ems.department.dto.DepartmentCreateRequest;
import com.example.ems.department.dto.DepartmentResponse;
import com.example.ems.department.dto.DepartmentUpdateRequest;
import com.example.ems.domain.Department;
import com.example.ems.domain.Employee;
import com.example.ems.exception.ConflictException;
import com.example.ems.exception.NotFoundException;
import com.example.ems.repository.DepartmentRepository;
import com.example.ems.repository.EmployeeRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DepartmentService {
  private static final Logger log = LoggerFactory.getLogger(DepartmentService.class);

  private final DepartmentRepository departmentRepo;
  private final EmployeeRepository employeeRepo;

  public DepartmentService(DepartmentRepository departmentRepo, EmployeeRepository employeeRepo) {
    this.departmentRepo = departmentRepo;
    this.employeeRepo = employeeRepo;
  }

  @Transactional(readOnly = true)
  public List<DepartmentResponse> list() {
    return departmentRepo.findAll().stream().map(this::toResponse).toList();
  }

  @Transactional
  public DepartmentResponse create(DepartmentCreateRequest req) {
    if (departmentRepo.existsByNameIgnoreCase(req.name())) {
      throw new ConflictException("Department already exists");
    }
    Department d = new Department();
    d.setName(req.name().trim());
    
    if (req.managerId() != null) {
      Employee manager = employeeRepo.findById(req.managerId())
          .orElseThrow(() -> new NotFoundException("Manager employee not found"));
      d.setManager(manager);
    }

    departmentRepo.save(d);
    log.info("Created department: {}", d.getName());
    return toResponse(d);
  }

  @Transactional
  public DepartmentResponse update(UUID id, DepartmentUpdateRequest req) {
    Department d = departmentRepo.findById(id).orElseThrow(() -> new NotFoundException("Department not found"));
    String newName = req.name().trim();
    departmentRepo.findByNameIgnoreCase(newName).ifPresent(existing -> {
      if (!existing.getId().equals(id)) {
        throw new ConflictException("Department name already in use");
      }
    });
    d.setName(newName);

    if (req.managerId() != null) {
      Employee manager = employeeRepo.findById(req.managerId())
          .orElseThrow(() -> new NotFoundException("Manager employee not found"));
      d.setManager(manager);
    } else {
      d.setManager(null);
    }

    departmentRepo.save(d);
    log.info("Updated department {} -> {}", id, newName);
    return toResponse(d);
  }

  @Transactional
  public void delete(UUID id) {
    if (!departmentRepo.existsById(id)) {
      throw new NotFoundException("Department not found");
    }
    if (employeeRepo.existsByDepartmentIdAndDeletedFalse(id)) {
      throw new ConflictException("Department has employees. Reassign employees before deleting.");
    }
    departmentRepo.deleteById(id);
    log.info("Deleted department: {}", id);
  }

  @Transactional(readOnly = true)
  public Department getOrNull(UUID id) {
    if (id == null) return null;
    return departmentRepo.findById(id).orElseThrow(() -> new NotFoundException("Department not found"));
  }

  @Transactional(readOnly = true)
  public com.example.ems.department.dto.DepartmentMetricsResponse getMetrics(UUID id) {
    if (!departmentRepo.existsById(id)) {
      throw new NotFoundException("Department not found");
    }
    List<Employee> employees = employeeRepo.findByDepartmentIdAndDeletedFalse(id);
    long count = employees.size();
    BigDecimal totalSalary = employees.stream()
        .map(Employee::getSalary)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal averageSalary = count > 0
        ? totalSalary.divide(BigDecimal.valueOf(count), RoundingMode.HALF_UP)
        : BigDecimal.ZERO;
        
    return new com.example.ems.department.dto.DepartmentMetricsResponse(count, totalSalary, averageSalary);
  }

  private DepartmentResponse toResponse(Department d) {
    UUID managerId = null;
    String managerName = null;
    if (d.getManager() != null) {
      managerId = d.getManager().getId();
      managerName = d.getManager().getName();
    }
    return new DepartmentResponse(d.getId(), d.getName(), managerId, managerName);
  }
}
