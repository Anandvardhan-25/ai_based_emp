package com.example.ems.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DepartmentUpdateRequest(
    @NotBlank @Size(max = 120) String name
) {}

