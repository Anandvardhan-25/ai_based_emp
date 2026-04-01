package com.example.ems.attendance.dto;

import com.example.ems.attendance.AttendanceStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record AttendanceResponse(
    UUID id,
    UUID employeeId,
    String employeeName,
    LocalDate date,
    LocalTime loginTime,
    LocalTime logoutTime,
    AttendanceStatus status,
    Double hoursWorked
) {}
