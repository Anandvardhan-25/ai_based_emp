package com.example.ems.document;
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
