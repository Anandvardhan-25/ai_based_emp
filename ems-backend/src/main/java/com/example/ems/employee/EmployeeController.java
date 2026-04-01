package com.example.ems.employee;

import com.example.ems.common.dto.PageResponse;
import com.example.ems.employee.dto.EmployeeCreateRequest;
import com.example.ems.employee.dto.EmployeeCreateResponse;
import com.example.ems.employee.dto.EmployeeResponse;
import com.example.ems.employee.dto.EmployeeUpdateRequest;
import com.example.ems.employee.dto.TransferEmployeeRequest;
import com.example.ems.security.UserPrincipal;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
  private final EmployeeService employeeService;

  public EmployeeController(EmployeeService employeeService) {
    this.employeeService = employeeService;
  }

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','HR','EMPLOYEE')")
  public ResponseEntity<PageResponse<EmployeeResponse>> list(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "name") String sortBy,
      @RequestParam(defaultValue = "asc") String dir,
      @RequestParam(required = false) String search,
      @RequestParam(required = false) UUID departmentId
  ) {
    return ResponseEntity.ok(employeeService.list(page, size, sortBy, dir, search, departmentId));
  }

  @GetMapping("/{id}")
  public ResponseEntity<EmployeeResponse> get(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserPrincipal principal
  ) {
    return ResponseEntity.ok(employeeService.get(id, principal));
  }

  @GetMapping("/me")
  public ResponseEntity<EmployeeResponse> getMe(@AuthenticationPrincipal UserPrincipal principal) {
    return ResponseEntity.ok(employeeService.getByEmail(principal.email(), principal));
  }

  @PostMapping
  @PreAuthorize("hasAnyRole('ADMIN','HR')")
  public ResponseEntity<EmployeeCreateResponse> create(
      @Valid @RequestBody EmployeeCreateRequest req,
      @AuthenticationPrincipal UserPrincipal principal
  ) {
    return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.create(req, principal));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','HR')")
  public ResponseEntity<EmployeeResponse> update(
      @PathVariable UUID id,
      @Valid @RequestBody EmployeeUpdateRequest req,
      @AuthenticationPrincipal UserPrincipal principal
  ) {
    return ResponseEntity.ok(employeeService.update(id, req, principal));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','HR')")
  public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
    employeeService.delete(id, principal);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/{id}/department")
  @PreAuthorize("hasAnyRole('ADMIN','HR')")
  public ResponseEntity<EmployeeResponse> transfer(
      @PathVariable UUID id,
      @Valid @RequestBody TransferEmployeeRequest req,
      @AuthenticationPrincipal UserPrincipal principal
  ) {
    return ResponseEntity.ok(employeeService.transfer(id, req, principal));
  }
}
