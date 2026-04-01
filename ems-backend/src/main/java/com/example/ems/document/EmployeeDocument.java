package com.example.ems.document;
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
