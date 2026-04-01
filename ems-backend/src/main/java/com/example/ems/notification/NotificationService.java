package com.example.ems.notification;

import com.example.ems.common.dto.PageResponse;
import com.example.ems.domain.Employee;
import com.example.ems.domain.Notification;
import com.example.ems.domain.Role;
import com.example.ems.notification.dto.NotificationResponse;
import com.example.ems.repository.EmployeeRepository;
import com.example.ems.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    
    private final NotificationRepository notificationRepo;
    private final EmployeeRepository employeeRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepo, EmployeeRepository employeeRepo, SimpMessagingTemplate messagingTemplate) {
        this.notificationRepo = notificationRepo;
        this.employeeRepo = employeeRepo;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public void createNotification(UUID employeeId, String message) {
        Employee emp = employeeRepo.findById(employeeId).orElse(null);
        if (emp != null) {
            Notification notification = new Notification();
            notification.setEmployee(emp);
            notification.setMessage(message);
            notification.setRead(false);
            notificationRepo.save(notification);
            
            messagingTemplate.convertAndSendToUser(
                emp.getEmail(), 
                "/queue/notifications", 
                toResponse(notification)
            );
            
            log.info("Notification created for employee {}: {}", employeeId, message);
        }
    }
    
    @Transactional
    public void notifyAdmins(String message) {
        List<Employee> admins = employeeRepo.findByRoleInAndDeletedFalse(List.of(Role.ADMIN, Role.HR));
        for (Employee admin : admins) {
            Notification notification = new Notification();
            notification.setEmployee(admin);
            notification.setMessage(message);
            notification.setRead(false);
            notificationRepo.save(notification);
            
            messagingTemplate.convertAndSendToUser(
                admin.getEmail(), 
                "/queue/notifications", 
                toResponse(notification)
            );
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getMyNotifications(UUID employeeId, int page, int size) {
        Page<Notification> pagedResult = notificationRepo.findByEmployeeIdOrderByCreatedAtDesc(employeeId, PageRequest.of(page, size));
        return new PageResponse<>(
            pagedResult.getContent().stream().map(this::toResponse).toList(),
            pagedResult.getNumber(),
            pagedResult.getSize(),
            pagedResult.getTotalElements(),
            pagedResult.getTotalPages()
        );
    }

    @Transactional
    public void markAllAsRead(UUID employeeId) {
        notificationRepo.markAllAsReadByEmployeeId(employeeId);
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
            n.getId(),
            n.getMessage(),
            n.isRead(),
            n.getCreatedAt()
        );
    }
}
