package com.example.ems.audit;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name = "audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false) private String userEmail;
    @Column(nullable = false) private String action;
    @Column(nullable = false) private String entityName;
    @Column(nullable = false) private Instant timestamp;
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public String getUserEmail() { return userEmail; } public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getAction() { return action; } public void setAction(String action) { this.action = action; }
    public String getEntityName() { return entityName; } public void setEntityName(String entityName) { this.entityName = entityName; }
    public Instant getTimestamp() { return timestamp; } public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
