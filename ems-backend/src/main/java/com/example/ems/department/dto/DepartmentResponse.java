package com.example.ems.department.dto;

import java.util.UUID;

public record DepartmentResponse(
    UUID id,
    String name,
    UUID managerId,
    String managerName
) {}

