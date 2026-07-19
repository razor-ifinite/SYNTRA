package com.syntra.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private String secret;

    @BeforeEach
    void setUp() {
        // Need a sufficiently long base64 encoded string for HS256 (at least 256 bits / 32 bytes)
        byte[] keyBytes = new byte[32];
        for (int i = 0; i < 32; i++) {
            keyBytes[i] = (byte) i;
        }
        secret = Base64.getEncoder().encodeToString(keyBytes);
        long expirationMs = 3600000; // 1 hour

        jwtTokenProvider = new JwtTokenProvider(secret, expirationMs);
    }

    @Test
    void generateToken_ShouldReturnValidJwtToken() {
        String email = "test@example.com";
        String name = "Test User";
        String userId = "user-123";

        String token = jwtTokenProvider.generateToken(email, name, userId);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(email, jwtTokenProvider.getEmailFromToken(token));
    }

    @Test
    void validateToken_WithInvalidToken_ShouldReturnFalse() {
        String invalidToken = "this.is.not.a.valid.token";
        assertFalse(jwtTokenProvider.validateToken(invalidToken));
    }

    @Test
    void validateToken_WithExpiredToken_ShouldReturnFalse() {
        // Create a provider with 0ms expiration
        JwtTokenProvider shortLivedProvider = new JwtTokenProvider(secret, 0);
        String token = shortLivedProvider.generateToken("test@example.com", "Test", "user-123");

        // Token should already be expired
        assertFalse(shortLivedProvider.validateToken(token));
    }
}
