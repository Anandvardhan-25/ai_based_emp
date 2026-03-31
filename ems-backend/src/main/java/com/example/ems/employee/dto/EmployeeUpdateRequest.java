package com.example.ems.employee.dto;

import com.example.ems.domain.Role;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record EmployeeUpdateRequest(
    @NotBlank @Size(max = 160) String name,
    @Email @NotBlank @Size(max = 200) String email,
    @NotBlank @Size(max = 50) String phone,
    UUID departmentId,
    @NotNull @DecimalMin("0.00") BigDecimal salary,
    @NotNull Role role
) {}

