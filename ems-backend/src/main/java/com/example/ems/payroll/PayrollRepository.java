package com.example.ems.payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;
public interface PayrollRepository extends JpaRepository<Payroll, UUID> {
    List<Payroll> findByEmployeeId(UUID employeeId);
}
