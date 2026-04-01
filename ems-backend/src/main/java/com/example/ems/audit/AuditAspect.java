package com.example.ems.audit;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.time.Instant;

@Aspect
@Component
public class AuditAspect {
    private final AuditLogRepository auditLogRepository;
    public AuditAspect(AuditLogRepository auditLogRepository) { this.auditLogRepository = auditLogRepository; }
    
    @AfterReturning(pointcut = "@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
                               "@annotation(org.springframework.web.bind.annotation.PutMapping) || " +
                               "@annotation(org.springframework.web.bind.annotation.DeleteMapping)", returning = "result")
    public void logAction(JoinPoint joinPoint, Object result) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth != null && auth.getName() != null) ? auth.getName() : "system";
        String method = joinPoint.getSignature().getName();
        String clazz = joinPoint.getTarget().getClass().getSimpleName();
        String action = method.toLowerCase().contains("delete") ? "DELETE" : 
                        method.toLowerCase().contains("put") || method.toLowerCase().contains("update") ? "UPDATE" : "CREATE";
        
        AuditLog log = new AuditLog();
        log.setUserEmail(email);
        log.setAction(action);
        log.setEntityName(clazz.replace("Controller", ""));
        log.setTimestamp(Instant.now());
        auditLogRepository.save(log);
    }
}
