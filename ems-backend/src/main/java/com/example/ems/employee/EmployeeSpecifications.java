package com.example.ems.employee;

import com.example.ems.domain.Employee;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class EmployeeSpecifications {
  private EmployeeSpecifications() {}

  public static Specification<Employee> notDeleted() {
    return (root, query, cb) -> cb.isFalse(root.get("deleted"));
  }

  public static Specification<Employee> search(String term) {
    if (term == null || term.isBlank()) {
      return null;
    }
    String like = "%" + term.trim().toLowerCase() + "%";
    return (root, query, cb) -> {
      query.distinct(true);
      return cb.or(
        cb.like(cb.lower(root.get("name")), like),
        cb.like(cb.lower(root.get("email")), like),
        cb.like(cb.lower(root.join("department", jakarta.persistence.criteria.JoinType.LEFT).get("name")), like)
      );
    };
  }

  public static Specification<Employee> department(UUID departmentId) {
    if (departmentId == null) {
      return null;
    }
    return (root, query, cb) -> cb.equal(root.join("department", jakarta.persistence.criteria.JoinType.INNER).get("id"), departmentId);
  }
}
