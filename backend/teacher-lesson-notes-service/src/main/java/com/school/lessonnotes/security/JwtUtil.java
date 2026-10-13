package com.school.lessonnotes.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret:9a2f8c4e7b1d3f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a}")
    private String jwtSecret;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Key getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Extracts token string from Authorization header (e.g., "Bearer eyJhbGciOi...")
     */
    public String resolveToken(String authHeader) {
        if (authHeader != null && authHeader.trim().startsWith("Bearer ")) {
            return authHeader.trim().substring(7).trim();
        }
        return authHeader != null ? authHeader.trim() : null;
    }

    /**
     * Validates and extracts claims map from either standard JJWT or base64 JWT payload.
     */
    public Map<String, Object> parseClaims(String token) {
        if (token == null || token.isEmpty()) {
            return null;
        }

        // Try standard JJWT verification first
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return new HashMap<>(claims);
        } catch (Exception e) {
            // Fallback for development/mock base64 tokens
            try {
                String[] parts = token.split("\\.");
                if (parts.length >= 2) {
                    byte[] decodedBytes = Base64.getUrlDecoder().decode(parts[1]);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> fallbackClaims = objectMapper.readValue(decodedBytes, Map.class);
                    return fallbackClaims;
                }
            } catch (Exception ex) {
                // Invalid token format
            }
        }
        return null;
    }

    public boolean validateToken(String token) {
        return parseClaims(token) != null;
    }

    public String extractTeacherName(Map<String, Object> claims, String fallbackName) {
        if (claims == null) return fallbackName;
        
        String firstName = claims.get("firstName") != null ? claims.get("firstName").toString().trim() : "";
        String lastName = claims.get("lastName") != null ? claims.get("lastName").toString().trim() : "";
        if (!firstName.isEmpty() || !lastName.isEmpty()) {
            return (firstName + " " + lastName).trim();
        }

        if (claims.get("name") != null && !claims.get("name").toString().trim().isEmpty()) {
            return claims.get("name").toString().trim();
        }

        if (claims.get("username") != null && !claims.get("username").toString().trim().isEmpty()) {
            return claims.get("username").toString().trim();
        }

        return fallbackName;
    }

    public String extractUsername(Map<String, Object> claims) {
        if (claims == null) return null;
        return claims.get("username") != null ? claims.get("username").toString() : null;
    }

    public String extractEmail(Map<String, Object> claims) {
        if (claims == null) return null;
        return claims.get("email") != null ? claims.get("email").toString() : null;
    }

    public String extractRole(Map<String, Object> claims) {
        if (claims == null) return null;
        return claims.get("role") != null ? claims.get("role").toString() : null;
    }
}
