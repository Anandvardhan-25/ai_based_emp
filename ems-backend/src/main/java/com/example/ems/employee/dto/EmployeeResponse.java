package com.example.ems.employee.dto;

import com.example.ems.domain.Role;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record EmployeeResponse(
    UUID id,
    String name,
    String email,
    String phone,
    DepartmentInfo department,
    BigDecimal salary,
    Role role,
    java.util.Set<String> skills,
    Instant createdAt,
    Instant updatedAt
) {
  public record DepartmentInfo(UUID id, String name) {}
}

