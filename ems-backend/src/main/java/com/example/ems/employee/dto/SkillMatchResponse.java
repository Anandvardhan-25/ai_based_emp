package com.example.ems.employee.dto;

import java.util.Set;
import java.util.UUID;

public record SkillMatchResponse(
    UUID employeeId,
    String employeeName,
    String employeeEmail,
    Set<String> matchedSkills,
    Set<String> missingSkills,
    double matchPercentage
) {}
