package com.example.ems.document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;
public interface DocumentRepository extends JpaRepository<EmployeeDocument, UUID> {
    List<EmployeeDocument> findByEmployeeId(UUID employeeId);
}
