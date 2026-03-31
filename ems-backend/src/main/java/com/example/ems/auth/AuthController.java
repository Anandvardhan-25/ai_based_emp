package com.example.ems.auth;

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
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
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
  private final SecurityContextRepository securityContextRepository;

  public AuthController(AuthenticationManager authenticationManager, SecurityContextRepository securityContextRepository) {
    this.authenticationManager = authenticationManager;
    this.securityContextRepository = securityContextRepository;
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

    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(auth);
    SecurityContextHolder.setContext(context);
    request.getSession(true);
    securityContextRepository.saveContext(context, request, response);

    UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
    log.info("User logged in: {}", principal.email());
    return ResponseEntity.ok(new MeResponse(principal.email(), principal.role()));
  }

  @GetMapping("/me")
  public ResponseEntity<MeResponse> me(Authentication auth) {
    UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
    return ResponseEntity.ok(new MeResponse(principal.email(), principal.role()));
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response, Authentication auth) {
    new SecurityContextLogoutHandler().logout(request, response, auth);
    return ResponseEntity.noContent().build();
  }
}
