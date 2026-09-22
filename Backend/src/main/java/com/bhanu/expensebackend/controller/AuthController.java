package com.bhanu.expensebackend.controller;

import com.bhanu.expensebackend.dto.*;
import com.bhanu.expensebackend.entity.User;
import com.bhanu.expensebackend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication and device pairing endpoints.
 *
 * All endpoints under /api/auth/** are publicly accessible (configured in SecurityConfig).
 * /api/auth/me and /api/auth/device-token require an authenticated user.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user account.
     * Returns a JWT token — the user is logged in immediately after registration.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    /**
     * Login with email and password.
     * Returns a JWT token valid for 24 hours (configurable via JWT_EXPIRATION_MS).
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Returns the current authenticated user's profile.
     * Can be used by the frontend to verify token validity and fetch user info.
     * SECURITY: password hash is never included in the response.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "createdAt", user.getCreatedAt()
        ));
    }

    /**
     * Issue a long-lived device token for an Android device.
     *
     * Flow:
     * 1. Android user logs in via /api/auth/login (gets a short-lived JWT).
     * 2. Android calls this endpoint with that JWT to get a long-lived device token.
     * 3. The raw device token is returned ONCE and must be stored on the device.
     * 4. All subsequent SMS-triggered requests use the device token as Bearer auth.
     *
     * SECURITY: Only the SHA-256 hash of the raw token is stored server-side.
     */
    @PostMapping("/device-token")
    public ResponseEntity<DeviceTokenResponse> issueDeviceToken(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) DeviceTokenRequest request) {

        String deviceName = (request != null) ? request.getDeviceName() : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.issueDeviceToken(user, request));
    }

    @GetMapping("/devices")
    public ResponseEntity<java.util.List<DeviceTokenDto>> getDevices(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.getUserDevices(user));
    }

    @DeleteMapping("/devices/{id}")
    public ResponseEntity<Void> disconnectDevice(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        authService.revokeDevice(user, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/devices/{id}/sync-status")
    public ResponseEntity<Void> updateSyncStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody DeviceSyncStatusRequest request) {
        authService.updateDeviceSyncStatus(user, id, request);
        return ResponseEntity.ok().build();
    }
}
