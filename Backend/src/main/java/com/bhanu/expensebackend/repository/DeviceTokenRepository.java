package com.bhanu.expensebackend.repository;

import com.bhanu.expensebackend.entity.DeviceToken;
import com.bhanu.expensebackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {

    /**
     * Look up a device by the SHA-256 hash of its raw token.
     * Used by JwtAuthFilter to authenticate Android SMS requests.
     */
    Optional<DeviceToken> findByTokenHash(String tokenHash);

    /** List all paired devices for a user (for Profile page in Phase 3). */
    List<DeviceToken> findByUser(User user);
}
