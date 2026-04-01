package com.example.ems.leave;

import com.example.ems.common.dto.PageResponse;
import com.example.ems.leave.dto.LeaveApplyRequest;
import com.example.ems.leave.dto.LeaveResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LeaveResponse applyForLeave(@Valid @RequestBody LeaveApplyRequest request) {
        return leaveService.applyForLeave(request);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<LeaveResponse> getAllLeaves(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return leaveService.getAllLeaves(page, size);
    }

    @GetMapping("/employee/{employeeId}")
    public PageResponse<LeaveResponse> getEmployeeLeaves(
            @PathVariable UUID employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return leaveService.getLeavesByEmployee(employeeId, page, size);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public LeaveResponse updateStatus(
            @PathVariable UUID id,
            @RequestParam LeaveStatus status
    ) {
        return leaveService.updateLeaveStatus(id, status);
    }
}
