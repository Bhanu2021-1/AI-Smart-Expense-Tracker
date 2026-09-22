package com.bhanu.expensebackend.security;

import com.bhanu.expensebackend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

/**
 * Utility for generating and validating JWT tokens.
 *
 * Key derivation: the raw JWT_SECRET string is SHA-256 hashed to produce
 * a deterministic 256-bit key, regardless of the secret's length.
 * This satisfies JJWT 0.12.x's minimum 256-bit requirement for HS256.
 *
 * SECURITY: Never log a JWT token. The token encodes user identity and acts
 * as authentication credentials for 24 hours.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration.ms}")
    private long expirationMs;

    /**
     * Generate a signed JWT for a registered/logged-in user.
     * Subject is the user's numeric ID (as a string).
     */
    public String generateToken(User user) {
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extract the user ID from a valid token.
     * Throws if the token is invalid or expired.
     */
    public Long extractUserId(String token) {
        return Long.parseLong(getClaims(token).getSubject());
    }

    /**
     * Returns true if the token is properly signed and not expired.
     * Returns false for any parse/validation failure (never throws).
     */
    public boolean isTokenValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Derives a 256-bit HMAC-SHA256 key from the configured secret string.
     * Using SHA-256 ensures the key is always exactly 256 bits regardless
     * of the secret's length.
     */
    private SecretKey getSigningKey() {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(secret.getBytes(StandardCharsets.UTF_8));
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm unavailable", e);
        }
    }
}
