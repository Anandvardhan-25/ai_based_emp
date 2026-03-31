package com.example.ems.department;

import com.example.ems.department.dto.DepartmentCreateRequest;
import com.example.ems.department.dto.DepartmentResponse;
import com.example.ems.department.dto.DepartmentUpdateRequest;
import com.example.ems.domain.Department;
import com.example.ems.exception.ConflictException;
import com.example.ems.exception.NotFoundException;
import com.example.ems.repository.DepartmentRepository;
import com.example.ems.repository.EmployeeRepository;
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

  private DepartmentResponse toResponse(Department d) {
    return new DepartmentResponse(d.getId(), d.getName());
  }
}
