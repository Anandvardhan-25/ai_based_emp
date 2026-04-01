package com.example.ems.leave.dto;

import com.example.ems.leave.LeaveStatus;
import com.example.ems.leave.LeaveType;
import java.time.LocalDate;
import java.util.UUID;

public record LeaveResponse(
    UUID id,
    UUID employeeId,
    String employeeName,
    LeaveType type,
    LocalDate startDate,
    LocalDate endDate,
    LeaveStatus status,
    String reason
) {}
