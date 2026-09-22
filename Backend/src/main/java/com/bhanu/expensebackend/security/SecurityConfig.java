package com.bhanu.expensebackend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Spring Security configuration.
 *
 * Key decisions:
 * - Stateless: no server-side session; authentication via JWT/device token on every request.
 * - CSRF disabled: stateless REST APIs don't need CSRF protection.
 * - CORS configured from environment variable — no hardcoded frontend URL.
 * - /api/auth/** is public; all other /api/** endpoints require authentication.
 * - H2 console is permitted for local development (disable H2_CONSOLE_ENABLED in production).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOriginsRaw;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter)
            throws Exception {

        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                    .authenticationEntryPoint((request, response, authException) -> {
                        response.sendError(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                    })
            )
            .authorizeHttpRequests(auth -> auth
                    // Permit Spring Boot's default error handling to avoid 403 on validation failures
                    .requestMatchers("/error").permitAll()
                    // Public: authentication endpoints
                    .requestMatchers("/api/auth/**").permitAll()
                    // Public: H2 console (local dev only — disable via H2_CONSOLE_ENABLED=false in prod)
                    .requestMatchers("/h2-console/**").permitAll()
                    // Everything else requires a valid JWT or device token
                    .anyRequest().authenticated()
            )
            // Required for H2 console's iframe-based UI
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            // JWT/device token filter runs before the standard username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Disable Spring Boot's automatic servlet registration of JwtAuthFilter.
     * Without this, the filter would run twice per request:
     * once as a regular servlet filter and once inside the Spring Security chain.
     * OncePerRequestFilter prevents duplicate execution, but disabling registration is cleaner.
     */
    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtFilterRegistration(JwtAuthFilter filter) {
        FilterRegistrationBean<JwtAuthFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    /**
     * CORS configuration sourced entirely from environment variables.
     * In development: http://localhost:5173 (Vite default).
     * In production: set CORS_ALLOWED_ORIGINS to the deployed frontend URL.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        List<String> origins = Arrays.stream(allowedOriginsRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        config.setAllowedOrigins(origins);
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "X-Requested-With", "Accept"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
