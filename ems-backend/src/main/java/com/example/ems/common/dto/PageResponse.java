package com.example.ems.common.dto;

import java.util.List;

public record PageResponse<T>(
    List<T> items,
    int page,
    int size,
    long totalItems,
    int totalPages
) {}

