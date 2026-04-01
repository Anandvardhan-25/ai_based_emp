package com.example.ems.audit;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/audit")
public class AuditLogController {
    private final AuditLogRepository repo;
    public AuditLogController(AuditLogRepository repo) { this.repo = repo; }
    @GetMapping
    public List<AuditLog> getLogs() { return repo.findAllByOrderByTimestampDesc(); }
}
