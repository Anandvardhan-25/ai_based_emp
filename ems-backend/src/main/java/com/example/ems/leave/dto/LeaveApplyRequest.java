package com.example.ems.leave.dto;

import com.example.ems.leave.LeaveType;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record LeaveApplyRequest(
    @NotNull(message = "Employee ID is required")
    UUID employeeId,
    
    @NotNull(message = "Leave type is required")
    LeaveType type,
    
    @NotNull(message = "Start date is required")
    LocalDate startDate,
    
    @NotNull(message = "End date is required")
    LocalDate endDate,
    
    String reason
) {}
