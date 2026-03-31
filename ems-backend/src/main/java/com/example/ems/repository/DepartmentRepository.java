package com.example.ems.repository;

import com.example.ems.domain.Department;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {
  Optional<Department> findByNameIgnoreCase(String name);
  boolean existsByNameIgnoreCase(String name);

  interface DepartmentCountView {
    UUID getDepartmentId();
    String getDepartmentName();
    long getEmployeeCount();
  }

  @Query("""
      select d.id as departmentId, d.name as departmentName, count(e) as employeeCount
      from Department d
      left join d.employees e on e.deleted = false
      group by d.id, d.name
      order by d.name asc
      """)
  java.util.List<DepartmentCountView> getDepartmentDistribution();
}

