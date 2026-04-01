package com.example.ems.department.dto;

import java.math.BigDecimal;

public record DepartmentMetricsResponse(
    long employeeCount,
    BigDecimal totalSalary,
    BigDecimal averageSalary
) {}
