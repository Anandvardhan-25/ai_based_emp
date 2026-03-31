package com.example.ems.employee;

import com.example.ems.common.dto.PageResponse;
import com.example.ems.department.DepartmentService;
import com.example.ems.domain.Department;
import com.example.ems.domain.Employee;
import com.example.ems.domain.UserAccount;
import com.example.ems.employee.dto.EmployeeCreateRequest;
import com.example.ems.employee.dto.EmployeeCreateResponse;
import com.example.ems.employee.dto.EmployeeResponse;
import com.example.ems.employee.dto.EmployeeUpdateRequest;
import com.example.ems.exception.ConflictException;
import com.example.ems.exception.NotFoundException;
import com.example.ems.repository.EmployeeRepository;
import com.example.ems.repository.UserAccountRepository;
import com.example.ems.security.UserPrincipal;
import java.security.SecureRandom;
import java.util.Locale;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {
  private static final Logger log = LoggerFactory.getLogger(EmployeeService.class);

  private final EmployeeRepository employeeRepo;
  private final UserAccountRepository userRepo;
  private final DepartmentService departmentService;
  private final PasswordEncoder passwordEncoder;

  public EmployeeService(
      EmployeeRepository employeeRepo,
      UserAccountRepository userRepo,
      DepartmentService departmentService,
      PasswordEncoder passwordEncoder
  ) {
    this.employeeRepo = employeeRepo;
    this.userRepo = userRepo;
    this.departmentService = departmentService;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional(readOnly = true)
  public PageResponse<EmployeeResponse> list(int page, int size, String sortBy, String dir, String search, UUID departmentId) {
    Sort.Direction direction = "desc".equalsIgnoreCase(dir) ? Sort.Direction.DESC : Sort.Direction.ASC;
    PageRequest pr = PageRequest.of(page, size, Sort.by(direction, sortBy == null || sortBy.isBlank() ? "name" : sortBy));

    Specification<Employee> spec = Specification.where(EmployeeSpecifications.notDeleted());
    
    Specification<Employee> searchSpec = EmployeeSpecifications.search(search);
    if (searchSpec != null) {
        spec = spec.and(searchSpec);
    }
    
    Specification<Employee> deptSpec = EmployeeSpecifications.department(departmentId);
    if (deptSpec != null) {
        spec = spec.and(deptSpec);
    }

    Page<Employee> result = employeeRepo.findAll(spec, pr);

    return new PageResponse<>(
        result.getContent().stream().map(this::toResponse).toList(),
        result.getNumber(),
        result.getSize(),
        result.getTotalElements(),
        result.getTotalPages()
    );
  }

  @Transactional(readOnly = true)
  public EmployeeResponse get(UUID id, UserPrincipal principal) {
    Employee emp = employeeRepo.findByIdAndDeletedFalse(id).orElseThrow(() -> new NotFoundException("Employee not found"));
    if (principal.role() == com.example.ems.domain.Role.EMPLOYEE && !emp.getEmail().equalsIgnoreCase(principal.email())) {
      throw new AccessDeniedException("Not allowed");
    }
    return toResponse(emp);
  }

  @Transactional
  public EmployeeCreateResponse create(EmployeeCreateRequest req, UserPrincipal actor) {
    String email = req.email().trim().toLowerCase(Locale.ROOT);
    if (employeeRepo.existsByEmailIgnoreCase(email)) {
      throw new ConflictException("Employee email already exists");
    }
    if (userRepo.existsByEmailIgnoreCase(email)) {
      throw new ConflictException("A user already exists with this email");
    }

    Department dept = departmentService.getOrNull(req.departmentId());

    Employee emp = new Employee();
    emp.setName(req.name().trim());
    emp.setEmail(email);
    emp.setPhone(req.phone().trim());
    emp.setDepartment(dept);
    emp.setSalary(req.salary());
    emp.setRole(req.role());
    employeeRepo.save(emp);

    String rawPassword = (req.password() == null || req.password().isBlank())
        ? generatePassword()
        : req.password();

    UserAccount user = new UserAccount();
    user.setEmail(email);
    user.setPasswordHash(passwordEncoder.encode(rawPassword));
    user.setRole(req.role());
    user.setEnabled(true);
    userRepo.save(user);

    log.info("User {} created employee {} ({})", actor.email(), emp.getId(), email);
    return new EmployeeCreateResponse(toResponse(emp), req.password() == null || req.password().isBlank() ? rawPassword : null);
  }

  @Transactional
  public EmployeeResponse update(UUID id, EmployeeUpdateRequest req, UserPrincipal actor) {
    Employee emp = employeeRepo.findByIdAndDeletedFalse(id).orElseThrow(() -> new NotFoundException("Employee not found"));

    String newEmail = req.email().trim().toLowerCase(Locale.ROOT);
    if (!emp.getEmail().equalsIgnoreCase(newEmail) && employeeRepo.existsByEmailIgnoreCase(newEmail)) {
      throw new ConflictException("Employee email already exists");
    }
    if (!emp.getEmail().equalsIgnoreCase(newEmail) && userRepo.existsByEmailIgnoreCase(newEmail)) {
      throw new ConflictException("A user already exists with this email");
    }

    Department dept = departmentService.getOrNull(req.departmentId());

    String oldEmail = emp.getEmail();
    emp.setName(req.name().trim());
    emp.setEmail(newEmail);
    emp.setPhone(req.phone().trim());
    emp.setDepartment(dept);
    emp.setSalary(req.salary());
    emp.setRole(req.role());
    employeeRepo.save(emp);

    UserAccount user = userRepo.findByEmailIgnoreCase(oldEmail).orElse(null);
    if (user != null) {
      user.setEmail(newEmail);
      user.setRole(req.role());
      userRepo.save(user);
    }

    log.info("User {} updated employee {}", actor.email(), id);
    return toResponse(emp);
  }

  @Transactional
  public void delete(UUID id, UserPrincipal actor) {
    Employee emp = employeeRepo.findByIdAndDeletedFalse(id).orElseThrow(() -> new NotFoundException("Employee not found"));
    emp.setDeleted(true);
    employeeRepo.save(emp);

    userRepo.findByEmailIgnoreCase(emp.getEmail()).ifPresent(user -> {
      user.setEnabled(false);
      userRepo.save(user);
    });

    log.info("User {} deleted employee {}", actor.email(), id);
  }

  private EmployeeResponse toResponse(Employee e) {
    EmployeeResponse.DepartmentInfo dept = null;
    if (e.getDepartment() != null) {
      dept = new EmployeeResponse.DepartmentInfo(e.getDepartment().getId(), e.getDepartment().getName());
    }
    return new EmployeeResponse(
        e.getId(),
        e.getName(),
        e.getEmail(),
        e.getPhone(),
        dept,
        e.getSalary(),
        e.getRole(),
        e.getCreatedAt(),
        e.getUpdatedAt()
    );
  }

  private String generatePassword() {
    String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
    SecureRandom rnd = new SecureRandom();
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < 12; i++) {
      sb.append(alphabet.charAt(rnd.nextInt(alphabet.length())));
    }
    return sb.toString();
  }
}
