package com.bhanu.expensebackend.security;

import com.bhanu.expensebackend.entity.User;
import com.bhanu.expensebackend.repository.UserRepository;
import com.bhanu.expensebackend.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Servlet filter that authenticates incoming requests via JWT or device token.
 *
 * Authentication logic (in order):
 * 1. Extract Bearer token from Authorization header.
 * 2. If token looks like a JWT (three dot-separated parts), validate it and load the user.
 * 3. Otherwise, treat it as an Android device token: SHA-256 hash it and look it up in the DB.
 * 4. If valid, set the authenticated user into Spring Security's SecurityContext.
 * 5. Let the filter chain continue — Spring Security will enforce authorization.
 *
 * SECURITY: Never log the token itself. Failures are silently swallowed; Spring Security
 * will return 401 for unauthenticated requests to protected endpoints.
 *
 * NOTE: @Component + OncePerRequestFilter means Spring Boot auto-registers this as a
 * servlet filter. We disable that registration via FilterRegistrationBean in SecurityConfig
 * so it only runs within the Spring Security filter chain (not twice per request).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Skip if no Bearer token is present
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        // Skip if already authenticated in this request
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        try {
            if (isJwtFormat(token)) {
                authenticateWithJwt(token, request);
            } else {
                authenticateWithDeviceToken(token, request);
            }
        } catch (Exception e) {
            // Do not propagate — let Spring Security return 401
            log.warn("Authentication attempt failed for {} {}", request.getMethod(), request.getRequestURI());
        }

        chain.doFilter(request, response);
    }

    private void authenticateWithJwt(String token, HttpServletRequest request) {
        if (!jwtUtil.isTokenValid(token)) return;

        Long userId = jwtUtil.extractUserId(token);
        userRepository.findById(userId)
                .ifPresent(user -> setAuthentication(user, request));
    }

    private void authenticateWithDeviceToken(String token, HttpServletRequest request) {
        authService.validateDeviceToken(token)
                .ifPresent(user -> setAuthentication(user, request));
    }

    private void setAuthentication(User user, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    /**
     * JWTs have exactly three dot-separated base64url segments: header.payload.signature.
     * Android device tokens are hex strings with no dots.
     */
    private boolean isJwtFormat(String token) {
        String[] parts = token.split("\\.");
        return parts.length == 3;
    }
}
