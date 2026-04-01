package com.example.ems.attendance;

import com.example.ems.attendance.dto.AttendanceResponse;
import com.example.ems.common.dto.PageResponse;
import com.example.ems.domain.Employee;
import com.example.ems.exception.NotFoundException;
import com.example.ems.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public AttendanceService(AttendanceRepository attendanceRepository, EmployeeRepository employeeRepository, SimpMessagingTemplate messagingTemplate) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public void punchIn(String email) {
        Employee employee = employeeRepository.findByEmailIgnoreCaseAndDeletedFalse(email)
                .orElseThrow(() -> new NotFoundException("Employee not found"));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .orElseGet(() -> {
                    Attendance newAttendance = new Attendance();
                    newAttendance.setEmployee(employee);
                    newAttendance.setDate(today);
                    return newAttendance;
                });

        if (attendance.getLoginTime() == null) {
            attendance.setLoginTime(now);
            
            // Detect late login (assuming 9 AM is standard)
            if (now.isAfter(LocalTime.of(9, 15))) {
                attendance.setStatus(AttendanceStatus.LATE);
            } else {
                attendance.setStatus(AttendanceStatus.PRESENT);
            }
            
            attendanceRepository.save(attendance);
            messagingTemplate.convertAndSend("/topic/dashboard", "UPDATE");
        }
    }

    @Transactional
    public void punchOut(String email) {
        Employee employee = employeeRepository.findByEmailIgnoreCaseAndDeletedFalse(email).orElse(null);
        if (employee == null) return;

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today).ifPresent(attendance -> {
            if (attendance.getLoginTime() != null) {
                attendance.setLogoutTime(now);
                
                // Calculate hours worked
                Duration duration = Duration.between(attendance.getLoginTime(), attendance.getLogoutTime());
                double hours = duration.toMinutes() / 60.0;
                // Round to 2 decimal places
                attendance.setHoursWorked(Math.round(hours * 100.0) / 100.0);
                
                if (attendance.getHoursWorked() < 4.0 && attendance.getStatus() != AttendanceStatus.LATE) {
                    attendance.setStatus(AttendanceStatus.HALF_DAY);
                }
                
                attendanceRepository.save(attendance);
                messagingTemplate.convertAndSend("/topic/dashboard", "UPDATE");
            }
        });
    }

    @Transactional(readOnly = true)
    public PageResponse<AttendanceResponse> getAttendanceByEmployee(UUID employeeId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        Page<Attendance> records = attendanceRepository.findByEmployeeId(employeeId, pageable);
        return new PageResponse<>(
                records.map(this::mapToResponse).getContent(),
                records.getNumber(),
                records.getSize(),
                records.getTotalElements(),
                records.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<AttendanceResponse> getAllAttendance(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        Page<Attendance> records = attendanceRepository.findAll(pageable);
        return new PageResponse<>(
                records.map(this::mapToResponse).getContent(),
                records.getNumber(),
                records.getSize(),
                records.getTotalElements(),
                records.getTotalPages()
        );
    }

    private AttendanceResponse mapToResponse(Attendance record) {
        return new AttendanceResponse(
                record.getId(),
                record.getEmployee().getId(),
                record.getEmployee().getName(),
                record.getDate(),
                record.getLoginTime(),
                record.getLogoutTime(),
                record.getStatus(),
                record.getHoursWorked()
        );
    }
}
