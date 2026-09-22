package com.bhanu.expensebackend.service;

import com.bhanu.expensebackend.dto.*;
import com.bhanu.expensebackend.entity.DeviceToken;
import com.bhanu.expensebackend.entity.User;
import com.bhanu.expensebackend.repository.DeviceTokenRepository;
import com.bhanu.expensebackend.repository.UserRepository;
import com.bhanu.expensebackend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Handles user registration, login, and Android device token management.
 *
 * SECURITY NOTES:
 * - Passwords are hashed with BCrypt before storage (PasswordEncoder).
 * - Device tokens are hashed with SHA-256 before storage (sha256 helper).
 * - Raw tokens/passwords are NEVER logged or stored.
 * - Generic error messages for login failures prevent user enumeration.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${jwt.expiration.ms}")
    private long expirationMs;

    // ─── Registration ──────────────────────────────────────────────────────────

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An account with this email already exists");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        user = userRepository.save(user);
        log.info("New user registered: id={}", user.getId());

        String token = jwtUtil.generateToken(user);
        return buildAuthResponse(token, user);
    }

    // ─── Login ─────────────────────────────────────────────────────────────────

    /**
     * Validates credentials manually using PasswordEncoder rather than
     * AuthenticationManager to avoid circular bean dependency issues.
     *
     * Uses the same generic error message for both "user not found" and
     * "wrong password" to prevent user enumeration attacks.
     */
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        final String errorMessage = "Invalid email or password";

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, errorMessage));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, errorMessage);
        }

        log.info("User logged in: id={}", user.getId());
        String token = jwtUtil.generateToken(user);
        return buildAuthResponse(token, user);
    }

    // ─── Device Token (Android auth) ──────────────────────────────────────────

    /**
     * Generates a random device token, stores its SHA-256 hash, and returns
     * the raw token to the caller exactly once.
     *
     * The raw token is a concatenation of two UUIDs (stripped of hyphens),
     * giving 256 bits of entropy. The server never sees it again after this call.
     */
    public DeviceTokenResponse issueDeviceToken(User user, DeviceTokenRequest request) {
        String rawToken = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");
        String tokenHash = sha256(rawToken);

        DeviceToken deviceToken = DeviceToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .deviceName(request != null && request.getDeviceName() != null && !request.getDeviceName().isBlank()
                        ? request.getDeviceName().trim() : "Android Device")
                .androidVersion(request != null ? request.getAndroidVersion() : null)
                .appVersion(request != null ? request.getAppVersion() : null)
                .build();

        deviceTokenRepository.save(deviceToken);
        log.info("Device token issued for user id={}, device='{}'", user.getId(), deviceToken.getDeviceName());

        return DeviceTokenResponse.builder()
                .token(rawToken)
                .deviceName(deviceToken.getDeviceName())
                .note("Store this token securely on your device. It will not be shown again.")
                .build();
    }

    public java.util.List<DeviceTokenDto> getUserDevices(User user) {
        return deviceTokenRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(token -> DeviceTokenDto.builder()
                        .id(token.getId())
                        .deviceName(token.getDeviceName())
                        .androidVersion(token.getAndroidVersion())
                        .appVersion(token.getAppVersion())
                        .syncStatus(token.getSyncStatus())
                        .createdAt(token.getCreatedAt())
                        .lastUsed(token.getLastUsed())
                        .lastSync(token.getLastSync())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    public void revokeDevice(User user, Long deviceId) {
        DeviceToken token = deviceTokenRepository.findById(deviceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Device not found"));

        if (!token.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Device not found");
        }

        deviceTokenRepository.delete(token);
        log.info("Device revoked: id={} for user={}", deviceId, user.getId());
    }

    public void updateDeviceSyncStatus(User user, Long deviceId, DeviceSyncStatusRequest request) {
        DeviceToken token = deviceTokenRepository.findById(deviceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Device not found"));

        if (!token.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Device not found");
        }

        if (request.getSyncStatus() != null) {
            token.setSyncStatus(request.getSyncStatus());
        }
        token.setLastSync(LocalDateTime.now());
        deviceTokenRepository.save(token);
    }

    public Optional<User> validateDeviceToken(String rawToken) {
        String tokenHash = sha256(rawToken);
        return deviceTokenRepository.findByTokenHash(tokenHash)
                .map(deviceToken -> {
                    deviceToken.setLastUsed(LocalDateTime.now());
                    deviceTokenRepository.save(deviceToken);
                    return deviceToken.getUser();
                });
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .expiresIn(expirationMs / 1000L)
                .name(user.getName())
                .email(user.getEmail())
                .userId(user.getId())
                .build();
    }

    /**
     * Computes the SHA-256 hex digest of a string.
     * Used for device token hashing — not for passwords (use BCrypt for those).
     *
     * Device tokens have sufficient entropy (256 bits random) that SHA-256
     * is appropriate without a salt or additional rounds.
     */
    public static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(64);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm unavailable", e);
        }
    }
}
