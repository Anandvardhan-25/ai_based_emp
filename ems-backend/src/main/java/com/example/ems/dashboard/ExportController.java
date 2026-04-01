package com.example.ems.dashboard;
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
        String header = "ID,Name,Email,Department,Role,Salary\n";
        String csv = emps.stream().map(e -> String.format("%s,%s,%s,%s,%s,%s",
            e.getId(), e.getName(), e.getEmail(), 
            e.getDepartment() != null ? e.getDepartment().getName() : "", 
            e.getRole(), e.getSalary()
        )).collect(Collectors.joining("\n"));
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=employees.csv")
            .body(header + csv);
    }
}
