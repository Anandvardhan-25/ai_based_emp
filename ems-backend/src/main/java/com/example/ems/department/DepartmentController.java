package com.example.ems.department;

import com.example.ems.department.dto.DepartmentCreateRequest;
import com.example.ems.department.dto.DepartmentResponse;
import com.example.ems.department.dto.DepartmentUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {
  private final DepartmentService departmentService;

  public DepartmentController(DepartmentService departmentService) {
    this.departmentService = departmentService;
  }

  @GetMapping
  public ResponseEntity<List<DepartmentResponse>> list() {
    return ResponseEntity.ok(departmentService.list());
  }

  @PostMapping
  @PreAuthorize("hasAnyRole('ADMIN','HR')")
  public ResponseEntity<DepartmentResponse> create(@Valid @RequestBody DepartmentCreateRequest req) {
    return ResponseEntity.status(HttpStatus.CREATED).body(departmentService.create(req));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','HR')")
  public ResponseEntity<DepartmentResponse> update(@PathVariable UUID id, @Valid @RequestBody DepartmentUpdateRequest req) {
    return ResponseEntity.ok(departmentService.update(id, req));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','HR')")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    departmentService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
