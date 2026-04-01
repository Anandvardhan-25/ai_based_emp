package com.example.ems.leave;

import com.example.ems.common.dto.PageResponse;
import com.example.ems.domain.Employee;
import com.example.ems.exception.NotFoundException;
import com.example.ems.leave.dto.LeaveApplyRequest;
import com.example.ems.leave.dto.LeaveResponse;
import com.example.ems.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final com.example.ems.notification.NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    public LeaveService(LeaveRepository leaveRepository, EmployeeRepository employeeRepository, com.example.ems.notification.NotificationService notificationService, SimpMessagingTemplate messagingTemplate) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public LeaveResponse applyForLeave(LeaveApplyRequest request) {
        Employee employee = employeeRepository.findByIdAndDeletedFalse(request.employeeId())
                .orElseThrow(() -> new NotFoundException("Employee not found"));

        if (request.startDate().isAfter(request.endDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        Leave leave = new Leave();
        leave.setEmployee(employee);
        leave.setType(request.type());
        leave.setStartDate(request.startDate());
        leave.setEndDate(request.endDate());
        leave.setReason(request.reason());
        leave.setStatus(LeaveStatus.PENDING);

        Leave savedLeave = leaveRepository.save(leave);
        messagingTemplate.convertAndSend("/topic/dashboard", "UPDATE");
        return mapToResponse(savedLeave);
    }

    @Transactional
    public LeaveResponse updateLeaveStatus(UUID leaveId, LeaveStatus status) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new NotFoundException("Leave request not found"));

        leave.setStatus(status);
        Leave savedLeave = leaveRepository.save(leave);
        
        if (status == LeaveStatus.APPROVED || status == LeaveStatus.REJECTED) {
            notificationService.createNotification(
                leave.getEmployee().getId(), 
                "Your leave request from " + leave.getStartDate() + " to " + leave.getEndDate() + " has been " + status.name().toLowerCase() + "."
            );
        }
        
        messagingTemplate.convertAndSend("/topic/dashboard", "UPDATE");
        return mapToResponse(savedLeave);
    }

    @Transactional(readOnly = true)
    public PageResponse<LeaveResponse> getAllLeaves(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Leave> leaves = leaveRepository.findAll(pageable);
        return new PageResponse<>(
                leaves.map(this::mapToResponse).getContent(),
                leaves.getNumber(),
                leaves.getSize(),
                leaves.getTotalElements(),
                leaves.getTotalPages());
    }

    @Transactional(readOnly = true)
    public PageResponse<LeaveResponse> getLeavesByEmployee(UUID employeeId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Leave> leaves = leaveRepository.findByEmployeeId(employeeId, pageable);
        return new PageResponse<>(
                leaves.map(this::mapToResponse).getContent(),
                leaves.getNumber(),
                leaves.getSize(),
                leaves.getTotalElements(),
                leaves.getTotalPages());
    }

    private LeaveResponse mapToResponse(Leave leave) {
        return new LeaveResponse(
                leave.getId(),
                leave.getEmployee().getId(),
                leave.getEmployee().getName(),
                leave.getType(),
                leave.getStartDate(),
                leave.getEndDate(),
                leave.getStatus(),
                leave.getReason());
    }
}
