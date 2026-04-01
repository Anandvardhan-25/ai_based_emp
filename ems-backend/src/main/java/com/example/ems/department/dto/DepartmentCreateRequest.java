package com.example.ems.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record DepartmentCreateRequest(
    @NotBlank @Size(max = 120) String name,
    UUID managerId
) {}

