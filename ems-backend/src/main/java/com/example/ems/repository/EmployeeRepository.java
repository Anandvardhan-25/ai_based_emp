package com.example.ems.repository;

import com.example.ems.domain.Employee;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EmployeeRepository extends JpaRepository<Employee, UUID>, JpaSpecificationExecutor<Employee> {
  boolean existsByEmailIgnoreCase(String email);
  Optional<Employee> findByIdAndDeletedFalse(UUID id);
  Optional<Employee> findByEmailIgnoreCaseAndDeletedFalse(String email);
  long countByDeletedFalse();
  boolean existsByDepartmentIdAndDeletedFalse(UUID departmentId);
  java.util.List<Employee> findTop10ByDeletedFalseOrderByUpdatedAtDesc();
}
