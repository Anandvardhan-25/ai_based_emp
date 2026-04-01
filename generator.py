import os

# Backend Base Path
base_pkg = r"c:\Users\banan\OneDrive\Desktop\tt project\ems-backend\src\main\java\com\example\ems"

def write(path, content):
    full = os.path.join(base_pkg, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)

# 1. Audit Log
write("audit/AuditLog.java", """package com.example.ems.audit;
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
""")

write("audit/AuditLogRepository.java", """package com.example.ems.audit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findAllByOrderByTimestampDesc();
}
""")

write("audit/AuditLogController.java", """package com.example.ems.audit;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/audit")
public class AuditLogController {
    private final AuditLogRepository repo;
    public AuditLogController(AuditLogRepository repo) { this.repo = repo; }
    @GetMapping
    public List<AuditLog> getLogs() { return repo.findAllByOrderByTimestampDesc(); }
}
""")

# 2. Document Management
write("document/EmployeeDocument.java", """package com.example.ems.document;
import com.example.ems.domain.Employee;
import com.example.ems.domain.AuditedEntity;
import jakarta.persistence.*;
import java.util.UUID;
@Entity @Table(name = "employee_documents")
public class EmployeeDocument extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne @JoinColumn(name="employee_id") private Employee employee;
    private String fileName;
    private String docType;
    private String fileUrl;
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public Employee getEmployee() { return employee; } public void setEmployee(Employee employee) { this.employee = employee; }
    public String getFileName() { return fileName; } public void setFileName(String fileName) { this.fileName = fileName; }
    public String getDocType() { return docType; } public void setDocType(String docType) { this.docType = docType; }
    public String getFileUrl() { return fileUrl; } public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
}
""")

write("document/DocumentRepository.java", """package com.example.ems.document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;
public interface DocumentRepository extends JpaRepository<EmployeeDocument, UUID> {
    List<EmployeeDocument> findByEmployeeId(UUID employeeId);
}
""")

write("document/DocumentController.java", """package com.example.ems.document;
import org.springframework.web.bind.annotation.*;
import com.example.ems.domain.Employee;
import com.example.ems.repository.EmployeeRepository;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.UUID;
@RestController @RequestMapping("/api/documents")
public class DocumentController {
    private final DocumentRepository repo;
    private final EmployeeRepository empRepo;
    public DocumentController(DocumentRepository repo, EmployeeRepository empRepo) { 
        this.repo = repo; this.empRepo = empRepo; 
    }
    @GetMapping("/{employeeId}")
    public List<EmployeeDocument> getDocs(@PathVariable UUID employeeId) {
        return repo.findByEmployeeId(employeeId);
    }
    @PostMapping("/{employeeId}")
    public ResponseEntity<EmployeeDocument> addDoc(@PathVariable UUID employeeId, @RequestBody EmployeeDocument doc) {
        Employee emp = empRepo.findById(employeeId).orElseThrow();
        doc.setEmployee(emp);
        return ResponseEntity.ok(repo.save(doc));
    }
}
""")

# 3. Payroll
write("payroll/Payroll.java", """package com.example.ems.payroll;
import com.example.ems.domain.Employee;
import com.example.ems.domain.AuditedEntity;
import jakarta.persistence.*;
import java.util.UUID;
import java.math.BigDecimal;
@Entity @Table(name = "payrolls")
public class Payroll extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne @JoinColumn(name="employee_id") private Employee employee;
    private int month;
    private int year;
    private BigDecimal baseSalary;
    private BigDecimal deductions;
    private BigDecimal netSalary;
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public Employee getEmployee() { return employee; } public void setEmployee(Employee employee) { this.employee = employee; }
    public int getMonth() { return month; } public void setMonth(int month) { this.month = month; }
    public int getYear() { return year; } public void setYear(int year) { this.year = year; }
    public BigDecimal getBaseSalary() { return baseSalary; } public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }
    public BigDecimal getDeductions() { return deductions; } public void setDeductions(BigDecimal deductions) { this.deductions = deductions; }
    public BigDecimal getNetSalary() { return netSalary; } public void setNetSalary(BigDecimal netSalary) { this.netSalary = netSalary; }
}
""")

write("payroll/PayrollRepository.java", """package com.example.ems.payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;
public interface PayrollRepository extends JpaRepository<Payroll, UUID> {
    List<Payroll> findByEmployeeId(UUID employeeId);
}
""")

write("payroll/PayrollController.java", """package com.example.ems.payroll;
import org.springframework.web.bind.annotation.*;
import com.example.ems.domain.Employee;
import com.example.ems.repository.EmployeeRepository;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;
@RestController @RequestMapping("/api/payroll")
public class PayrollController {
    private final PayrollRepository repo;
    private final EmployeeRepository empRepo;
    public PayrollController(PayrollRepository repo, EmployeeRepository empRepo) { 
        this.repo = repo; this.empRepo = empRepo; 
    }
    @GetMapping("/{employeeId}")
    public List<Payroll> getPayroll(@PathVariable UUID employeeId) {
        return repo.findByEmployeeId(employeeId);
    }
    @PostMapping("/{employeeId}")
    public ResponseEntity<Payroll> generate(@PathVariable UUID employeeId, @RequestBody Payroll req) {
        Employee emp = empRepo.findById(employeeId).orElseThrow();
        req.setEmployee(emp);
        req.setBaseSalary(emp.getSalary());
        req.setNetSalary(req.getBaseSalary().subtract(req.getDeductions() != null ? req.getDeductions() : BigDecimal.ZERO));
        return ResponseEntity.ok(repo.save(req));
    }
}
""")

# 4. Export endpoints in dashboard
write("dashboard/ExportController.java", """package com.example.ems.dashboard;
import com.example.ems.domain.Employee;
import com.example.ems.repository.EmployeeRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
@RestController @RequestMapping("/api/export")
public class ExportController {
    private final EmployeeRepository empRepo;
    public ExportController(EmployeeRepository empRepo) { this.empRepo = empRepo; }
    
    @GetMapping("/employees/csv")
    public ResponseEntity<String> exportEmployees() {
        List<Employee> emps = empRepo.findAll();
        String header = "ID,Name,Email,Department,Role,Salary\\n";
        String csv = emps.stream().map(e -> String.format("%s,%s,%s,%s,%s,%s",
            e.getId(), e.getName(), e.getEmail(), 
            e.getDepartment() != null ? e.getDepartment().getName() : "", 
            e.getRole(), e.getSalary()
        )).collect(Collectors.joining("\\n"));
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=employees.csv")
            .body(header + csv);
    }
}
""")

print("Generated files successfully.")
