package com.example.ems.payroll;
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
