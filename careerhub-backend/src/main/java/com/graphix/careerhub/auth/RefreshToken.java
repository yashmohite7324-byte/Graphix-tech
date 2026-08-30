package com.graphix.careerhub.auth;

import com.graphix.careerhub.common.BaseEntity;
import com.graphix.careerhub.users.User;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
public class RefreshToken extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String token;
    private LocalDateTime expiresAt;
    private boolean revoked = false;
}
