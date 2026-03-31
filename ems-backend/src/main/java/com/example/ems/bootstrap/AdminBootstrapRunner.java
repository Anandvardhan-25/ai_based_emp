package com.example.ems.bootstrap;

import com.example.ems.config.AppProperties;
import com.example.ems.domain.Role;
import com.example.ems.domain.UserAccount;
import com.example.ems.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapRunner implements ApplicationRunner {
  private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

  private final AppProperties props;
  private final UserAccountRepository userRepo;
  private final PasswordEncoder passwordEncoder;

  public AdminBootstrapRunner(AppProperties props, UserAccountRepository userRepo, PasswordEncoder passwordEncoder) {
    this.props = props;
    this.userRepo = userRepo;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  public void run(ApplicationArguments args) {
    String email = props.bootstrap().admin().email().trim().toLowerCase();
    if (userRepo.existsByEmailIgnoreCase(email)) {
      return;
    }

    UserAccount admin = new UserAccount();
    admin.setEmail(email);
    admin.setPasswordHash(passwordEncoder.encode(props.bootstrap().admin().password()));
    admin.setRole(Role.ADMIN);
    admin.setEnabled(true);
    userRepo.save(admin);

    log.info("Bootstrapped default admin user: {}", email);
  }
}
