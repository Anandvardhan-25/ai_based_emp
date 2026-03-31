package com.example.ems.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.ems.repository.UserAccountRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {
  private final UserAccountRepository userRepo;

  public CustomUserDetailsService(UserAccountRepository userRepo) {
    this.userRepo = userRepo;
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    return userRepo.findByEmailIgnoreCase(username)
        .map(UserPrincipal::from)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
  }
}
