package com.bhanu.expensebackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * General application beans that don't belong in SecurityConfig.
 *
 * Keeping PasswordEncoder here (rather than in SecurityConfig) avoids
 * potential circular dependency issues between SecurityConfig, JwtAuthFilter,
 * and AuthService during Spring context initialization.
 */
@Configuration
public class ApplicationConfig {

    /**
     * BCrypt with strength 12 — strong enough for a production app.
     * Higher strength = more CPU time per hash = harder to brute-force.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
