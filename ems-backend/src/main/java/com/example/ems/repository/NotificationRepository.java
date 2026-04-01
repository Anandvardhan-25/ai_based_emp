package com.example.ems.repository;

import com.example.ems.domain.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Page<Notification> findByEmployeeIdOrderByCreatedAtDesc(UUID employeeId, Pageable pageable);
    
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.employee.id = :employeeId AND n.read = false")
    void markAllAsReadByEmployeeId(UUID employeeId);
}
