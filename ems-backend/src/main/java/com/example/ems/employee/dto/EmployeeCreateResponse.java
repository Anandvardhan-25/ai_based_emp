package com.example.ems.employee.dto;

public record EmployeeCreateResponse(
    EmployeeResponse employee,
    String generatedPassword
) {}

