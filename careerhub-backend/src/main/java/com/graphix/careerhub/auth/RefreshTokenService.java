package com.graphix.careerhub.auth;

import com.graphix.careerhub.common.UnauthorizedException;
import com.graphix.careerhub.users.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public RefreshToken issue(User user) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000));
        refreshToken.setRevoked(false);
        return refreshTokenRepository.save(refreshToken);
    }

    /** Validates the token, revokes it, and issues a fresh one (rotation). */
    public RefreshToken rotate(String rawToken) {
        RefreshToken existing = refreshTokenRepository.findByTokenAndRevokedFalse(rawToken)
                .orElseThrow(() -> new UnauthorizedException("Invalid or already-used refresh token"));

        if (existing.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token expired, please log in again");
        }

        existing.setRevoked(true);
        refreshTokenRepository.save(existing);

        return issue(existing.getUser());
    }

    public void revokeAllForUser(RefreshToken token) {
        token.setRevoked(true);
        refreshTokenRepository.save(token);
    }
}
