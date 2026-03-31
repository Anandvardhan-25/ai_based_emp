package com.example.ems.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
    Cors cors,
    Bootstrap bootstrap
) {
  public record Cors(String origins) {}

  public record Bootstrap(
      Admin admin,
      String defaultUserPassword
  ) {
    public record Admin(String email, String password) {}
  }
}

