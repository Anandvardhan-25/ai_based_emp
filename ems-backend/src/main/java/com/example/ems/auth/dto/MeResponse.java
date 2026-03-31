package com.example.ems.auth.dto;

import com.example.ems.domain.Role;

public record MeResponse(
    String email,
    Role role
) {}

