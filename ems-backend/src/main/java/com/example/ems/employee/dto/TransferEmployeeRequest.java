package com.example.ems.employee.dto;

import java.util.UUID;
import jakarta.validation.constraints.NotNull;

public record TransferEmployeeRequest(
    @NotNull UUID departmentId
) {}
