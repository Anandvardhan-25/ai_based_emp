package com.example.ems.auth;

import com.example.ems.attendance.AttendanceService;

import com.example.ems.auth.dto.LoginRequest;
import com.example.ems.auth.dto.MeResponse;
import com.example.ems.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.ems.repository.EmployeeRepository;
import com.example.ems.repository.UserAccountRepository;
import com.example.ems.domain.UserAccount;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private static final Logger log = LoggerFactory.getLogger(AuthController.class);

  private final AuthenticationManager authenticationManager;
  private final AttendanceService attendanceService;
  private final OtpService otpService;
  private final EmployeeRepository employeeRepository;
  private final UserAccountRepository userAccountRepository;
  private final PasswordEncoder passwordEncoder;

  public AuthController(
      AuthenticationManager authenticationManager, 
      AttendanceService attendanceService,
      OtpService otpService,
      EmployeeRepository employeeRepository,
      UserAccountRepository userAccountRepository,
      PasswordEncoder passwordEncoder) {
    this.authenticationManager = authenticationManager;
    this.attendanceService = attendanceService;
    this.otpService = otpService;
    this.employeeRepository = employeeRepository;
    this.userAccountRepository = userAccountRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @PostMapping("/login")
  public ResponseEntity<MeResponse> login(
      @Valid @RequestBody LoginRequest req,
      HttpServletRequest request,
      HttpServletResponse response
  ) {
    Authentication auth = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.email(), req.password())
    );

    SecurityContext sc = SecurityContextHolder.getContext();
    sc.setAuthentication(auth);
    HttpSession session = request.getSession(true);
    session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, sc);

    UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
    log.info("User logged in: {}", principal.email());
    
    try {
        attendanceService.punchIn(principal.email());
    } catch(Exception e) {
        log.warn("Could not punch in for user: {}", e.getMessage());
    }

    return ResponseEntity.ok(new MeResponse(principal.email(), principal.role()));
  }

  @GetMapping("/me")
  public ResponseEntity<MeResponse> me(Authentication auth) {
    UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
    return ResponseEntity.ok(new MeResponse(principal.email(), principal.role()));
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response, Authentication auth) {
    if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
        try {
            attendanceService.punchOut(principal.email());
        } catch(Exception e) {
            log.warn("Could not punch out for user: {}", e.getMessage());
        }
    }
    
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<Void> forgotPassword(@RequestBody java.util.Map<String, String> body) {
      String email = body.get("email");
      if (email == null || !employeeRepository.existsByEmailIgnoreCase(email)) {
          return ResponseEntity.badRequest().build();
      }
      otpService.generateAndSendOtp(email);
      return ResponseEntity.ok().build();
  }

  @PostMapping("/verify-otp")
  public ResponseEntity<java.util.Map<String, Boolean>> verifyOtp(@RequestBody java.util.Map<String, String> body) {
      String email = body.get("email");
      String otp = body.get("otp");
      boolean valid = otpService.verifyOtp(email, otp);
      return ResponseEntity.ok(java.util.Map.of("valid", valid));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<Void> resetPassword(@RequestBody java.util.Map<String, String> body) {
      String email = body.get("email");
      String newPassword = body.get("newPassword");
      if (email == null || newPassword == null || !otpService.canResetPassword(email)) {
          return ResponseEntity.badRequest().build();
      }
      
      UserAccount account = userAccountRepository.findByEmailIgnoreCase(email).orElse(null);
      if (account != null) {
          account.setPasswordHash(passwordEncoder.encode(newPassword));
          userAccountRepository.save(account);
      }
      return ResponseEntity.ok().build();
  }
}
