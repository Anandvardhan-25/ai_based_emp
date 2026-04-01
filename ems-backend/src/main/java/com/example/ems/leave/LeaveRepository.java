package com.example.ems.leave;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface LeaveRepository extends JpaRepository<Leave, UUID> {
    Page<Leave> findByEmployeeId(UUID employeeId, Pageable pageable);
}
