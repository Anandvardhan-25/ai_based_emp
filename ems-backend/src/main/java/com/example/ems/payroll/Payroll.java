package com.example.ems.payroll;
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
