package com.bhanu.expensebackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents a paired Android device for a user.
 *
 * SECURITY: Only a SHA-256 hash of the device token is stored here.
 * The raw token is generated once, returned to the Android device,
 * and never persisted on the server. Verification is done by hashing
 * the incoming raw token and comparing with the stored hash.
 */
@Entity
@Table(name = "device_tokens")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * SHA-256 hex digest of the raw device token.
     * The raw token exists only on the Android device (SharedPreferences).
     */
    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "device_name")
    private String deviceName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Updated each time the device uses the token to authenticate. */
    @Column(name = "last_used")
    private LocalDateTime lastUsed;

    @PrePersist
    protected void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
